import prisma from "@/lib/db";

/**
 * Processes contract HTML to replace variable placeholders with their actual values
 */
export async function processContractVariables(
  html: string,
  feeStructure: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate: number;
    cancellationFee: number;
    paymentTerms?: string;
  },
  examinerData: {
    name: string;
    email: string;
    province?: string;
    city?: string;
    phone?: string;
    landlineNumber?: string;
    languagesSpoken?: string[];
    licenseNumber?: string;
    provinceOfLicensure?: string;
    specialties?: string[];
    yearsOfIMEExperience?: string;
  },
  contractFieldValues?: Record<string, any> | null,
): Promise<string> {
  let processed = html;

  // Build variable values map
  const variableValues = new Map<string, string>();

  // 1. Add fee structure variables
  variableValues.set("fee.ime_fee", feeStructure.IMEFee.toString());
  variableValues.set(
    "fee.record_review_fee",
    feeStructure.recordReviewFee.toString(),
  );
  variableValues.set("fee.hourly_rate", feeStructure.hourlyRate.toString());
  variableValues.set(
    "fee.cancellation_fee",
    feeStructure.cancellationFee.toString(),
  );
  if (feeStructure.paymentTerms) {
    variableValues.set("fee.payment_terms", feeStructure.paymentTerms);
  }

  // 2. Add examiner application variables (using new application.examiner_* format)
  variableValues.set("application.examiner_name", examinerData.name);
  variableValues.set("application.examiner_email", examinerData.email);

  if (examinerData.province) {
    variableValues.set("application.examiner_province", examinerData.province);
  }
  if (examinerData.city) {
    variableValues.set("application.examiner_city", examinerData.city);
  }
  if (examinerData.phone) {
    variableValues.set("application.examiner_phone", examinerData.phone);
  }
  if (examinerData.landlineNumber) {
    variableValues.set(
      "application.examiner_landline_number",
      examinerData.landlineNumber,
    );
  }
  if (
    examinerData.languagesSpoken &&
    Array.isArray(examinerData.languagesSpoken) &&
    examinerData.languagesSpoken.length > 0
  ) {
    variableValues.set(
      "application.examiner_languages_spoken",
      examinerData.languagesSpoken.join(", "),
    );
  }
  if (examinerData.licenseNumber) {
    variableValues.set(
      "application.examiner_license_number",
      examinerData.licenseNumber,
    );
  }
  if (examinerData.provinceOfLicensure) {
    variableValues.set(
      "application.examiner_province_of_licensure",
      examinerData.provinceOfLicensure,
    );
  }
  if (
    examinerData.specialties &&
    Array.isArray(examinerData.specialties) &&
    examinerData.specialties.length > 0
  ) {
    variableValues.set(
      "application.examiner_specialties",
      examinerData.specialties.join(", "),
    );
  }
  if (examinerData.yearsOfIMEExperience) {
    variableValues.set(
      "application.examiner_years_of_ime_experience",
      examinerData.yearsOfIMEExperience,
    );
  }

  // Also support legacy examiner.* format for backward compatibility
  variableValues.set("examiner.name", examinerData.name);
  variableValues.set("examiner.email", examinerData.email);
  if (examinerData.province) {
    variableValues.set("examiner.province", examinerData.province);
  }
  if (examinerData.city) {
    variableValues.set("examiner.city", examinerData.city);
  }

  // 3. Fetch custom variables from database
  try {
    const customVariables = await prisma.customVariable.findMany({
      where: { isActive: true },
    });

    customVariables.forEach((variable) => {
      // Use defaultValue for custom variables
      if (variable.defaultValue) {
        variableValues.set(variable.key, variable.defaultValue);
      }
    });
  } catch (error) {
    console.error("Error fetching custom variables:", error);
    // Continue processing even if custom variables fail to load
  }

  // 4. Add contract field values (from fieldValues JSON field)
  // IMPORTANT: This must come AFTER custom variables so that user-provided values (like signature) take precedence
  if (contractFieldValues) {
    console.log(
      `[processContractVariables] Processing fieldValues:`,
      JSON.stringify(contractFieldValues, null, 2),
    );

    // Handle nested objects (e.g., examiner.signature, examiner.checkbox_selections, examiner.signature_date_time)
    if (contractFieldValues.examiner) {
      const examinerFields = contractFieldValues.examiner as Record<
        string,
        any
      >;
      console.log(
        `[processContractVariables] examinerFields:`,
        JSON.stringify(examinerFields, null, 2),
      );

      if (examinerFields.checkbox_selections) {
        // Checkbox selections are handled separately in the UI
      }

      // Add examiner signature FIRST (before signature_date_time) - this takes precedence over custom variables
      if (examinerFields.signature) {
        const signatureValue = String(examinerFields.signature);
        variableValues.set("application.examiner_signature", signatureValue);
        variableValues.set("examiner.signature", signatureValue); // Legacy support
        console.log(
          `✅ Set application.examiner_signature from fieldValues (length: ${signatureValue.length})`,
        );
      } else {
        console.log(`⚠️ examiner.signature not found in examinerFields`);
      }

      // Add examiner.signature_date_time if it exists (both new and legacy formats)
      if (examinerFields.signature_date_time) {
        // Format the ISO date string to a readable format
        try {
          const date = new Date(examinerFields.signature_date_time);
          const formattedDateTime = date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          variableValues.set(
            "application.examiner_signature_date_time",
            formattedDateTime,
          );
          variableValues.set("examiner.signature_date_time", formattedDateTime); // Legacy support
          console.log(
            `✅ Set application.examiner_signature_date_time: ${formattedDateTime}`,
          );
        } catch (error) {
          // If parsing fails, use the raw value
          const rawValue = String(examinerFields.signature_date_time);
          variableValues.set(
            "application.examiner_signature_date_time",
            rawValue,
          );
          variableValues.set("examiner.signature_date_time", rawValue); // Legacy support
          console.log(
            `⚠️ Set application.examiner_signature_date_time (raw): ${rawValue}`,
          );
        }
      } else {
        console.log(
          "ℹ️ examiner.signature_date_time not found in examinerFields",
        );
      }
    } else {
      console.log(`⚠️ contractFieldValues.examiner is missing`);
    }

    // Add any other top-level field values
    Object.entries(contractFieldValues).forEach(([key, value]) => {
      if (typeof value === "string" && value) {
        variableValues.set(key, value);
      }
    });
  }

  // Protect checkbox groups first (similar to PageRender logic)
  const checkboxGroupPlaceholders: string[] = [];
  // Updated pattern to match both single and double quotes, and handle whitespace variations
  const checkboxGroupPattern =
    /<div[^>]*data-variable-type\s*=\s*["']checkbox_group["'][^>]*>/gi;
  let match;
  const groups: Array<{ start: number; end: number; html: string }> = [];

  console.log(
    `🔍 Looking for checkbox groups in HTML (length: ${processed.length})`,
  );

  // Check for checkbox groups in multiple ways
  const hasCheckboxGroups1 = processed.includes(
    'data-variable-type="checkbox_group"',
  );
  const hasCheckboxGroups2 = processed.includes(
    "data-variable-type='checkbox_group'",
  );
  const hasCheckboxGroups3 =
    /data-variable-type\s*=\s*["']checkbox_group["']/i.test(processed);
  const hasCheckboxGroups =
    hasCheckboxGroups1 || hasCheckboxGroups2 || hasCheckboxGroups3;

  console.log(
    `🔍 HTML contains checkbox_group attribute (double quotes): ${hasCheckboxGroups1}`,
  );
  console.log(
    `🔍 HTML contains checkbox_group attribute (single quotes): ${hasCheckboxGroups2}`,
  );
  console.log(
    `🔍 HTML contains checkbox_group attribute (regex): ${hasCheckboxGroups3}`,
  );

  // Debug: Show a sample of the HTML to see what's actually there
  if (processed.length > 0) {
    const sampleStart = processed.substring(0, Math.min(500, processed.length));
    const sampleEnd = processed.substring(Math.max(0, processed.length - 500));
    console.log(`🔍 HTML sample (first 500 chars): ${sampleStart}`);
    console.log(`🔍 HTML sample (last 500 chars): ${sampleEnd}`);

    // Look for any div with data-variable attributes
    const divPattern = /<div[^>]*data-variable[^>]*>/gi;
    const divMatches = processed.match(divPattern);
    if (divMatches) {
      console.log(
        `🔍 Found ${divMatches.length} divs with data-variable attributes:`,
        divMatches.slice(0, 5),
      );
    }
  }

  // Find all checkbox groups
  while ((match = checkboxGroupPattern.exec(processed)) !== null) {
    const startIndex = match.index;
    const openingTag = match[0];

    // Find matching closing tag
    let depth = 1;
    let currentIndex = startIndex + openingTag.length;

    while (depth > 0 && currentIndex < processed.length) {
      const nextOpen = processed.indexOf("<div", currentIndex);
      const nextClose = processed.indexOf("</div>", currentIndex);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        currentIndex = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          const endIndex = nextClose + 6;
          const html = processed.substring(startIndex, endIndex);
          groups.push({ start: startIndex, end: endIndex, html });
          break;
        }
        currentIndex = nextClose + 6;
      }
    }
  }

  console.log(`🔍 Found ${groups.length} checkbox groups to protect`);

  // Replace groups in reverse order
  groups.reverse().forEach((group, idx) => {
    const placeholder = `__CHECKBOX_GROUP_${checkboxGroupPlaceholders.length}__`;
    checkboxGroupPlaceholders.unshift(group.html);
    console.log(
      `  Protecting group ${idx}: ${group.html.substring(0, 100)}...`,
    );
    processed =
      processed.substring(0, group.start) +
      placeholder +
      processed.substring(group.end);
  });

  console.log(
    `✅ Protected ${checkboxGroupPlaceholders.length} checkbox groups`,
  );

  // Step 1: Extract variable keys from spans with data-variable attribute
  processed = processed.replace(
    /<span[^>]*data-variable="([^"]*)"[^>]*>(.*?)<\/span>/gi,
    (match, variableKey, content) => {
      return `{{${variableKey}}}`;
    },
  );

  // Step 2: Extract variable keys from spans with title attribute containing placeholder
  processed = processed.replace(
    /<span[^>]*title="\{\{([^}]+)\}\}"[^>]*>(.*?)<\/span>/gi,
    (match, variableKey) => {
      return `{{${variableKey}}}`;
    },
  );

  // Step 3: Extract variable keys from spans with border-bottom (underline) styling
  // These are the preview spans that show variables
  processed = processed.replace(
    /<span[^>]*style="[^"]*border-bottom:\s*2px[^"]*"[^>]*title="\{\{([^}]+)\}\}"[^>]*>(.*?)<\/span>/gi,
    (match, variableKey, content) => {
      return `{{${variableKey}}}`;
    },
  );

  // Step 4: Handle spans with variable classes
  processed = processed.replace(
    /<span[^>]*class="[^"]*variable-(valid|invalid)[^"]*"[^>]*>(.*?)<\/span>/gi,
    (match, _validity, content) => {
      const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
      if (placeholderMatch) {
        return placeholderMatch[0];
      }
      const dataVarMatch = match.match(/data-variable="([^"]*)"/);
      if (dataVarMatch) {
        return `{{${dataVarMatch[1]}}}`;
      }
      const titleMatch = match.match(/title="\{\{([^}]+)\}\}"/);
      if (titleMatch) {
        return `{{${titleMatch[1]}}}`;
      }
      return content;
    },
  );

  // Step 5: Handle any remaining spans with border-bottom that might be variables
  // Look for spans with border-bottom styling that contain placeholders or have title attributes
  processed = processed.replace(
    /<span[^>]*style="[^"]*border-bottom[^"]*"[^>]*>(.*?)<\/span>/gi,
    (match, content) => {
      // Check if content is a placeholder
      const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
      if (placeholderMatch) {
        return placeholderMatch[0];
      }
      // Check if the span has a title with placeholder
      const titleMatch = match.match(/title="\{\{([^}]+)\}\}"/);
      if (titleMatch) {
        return `{{${titleMatch[1]}}}`;
      }
      // If content is just whitespace/&nbsp;, try to extract from title
      if (/^[\s&nbsp;]*$/.test(content)) {
        const titlePlaceholderMatch = match.match(/title="\{\{([^}]+)\}\}"/);
        if (titlePlaceholderMatch) {
          return `{{${titlePlaceholderMatch[1]}}}`;
        }
      }
      // Otherwise, keep the span as is (might be a regular underline)
      return match;
    },
  );

  // Step 6: Replace variable placeholders with their values
  const placeholderRegex = /\{\{\s*([^}]+?)\s*\}\}/g;
  processed = processed.replace(placeholderRegex, (match, placeholder) => {
    const variableKey = placeholder.trim();
    const variableValue = variableValues.get(variableKey);

    if (variableValue) {
      // Special handling for signature placeholders - convert data URLs to img tags
      if (
        (variableKey === "application.examiner_signature" ||
          variableKey === "examiner.signature") &&
        typeof variableValue === "string"
      ) {
        const signatureValue = String(variableValue).trim();
        // Check if it's a data URL or HTTP URL
        if (
          signatureValue &&
          (signatureValue.startsWith("data:image/") ||
            signatureValue.startsWith("http://") ||
            signatureValue.startsWith("https://"))
        ) {
          console.log(
            `✅ Converting signature to img tag for ${variableKey} (length: ${signatureValue.length})`,
          );
          return `<img src="${signatureValue}" alt="Examiner Signature" data-signature="examiner" style="max-width: 240px; height: auto; display: inline-block;" />`;
        }
      }

      // Replace with value as regular text (no underline, no span)
      return variableValue;
    }

    // Log missing variables for debugging
    console.log(
      `Variable not found: ${variableKey}. Available keys:`,
      Array.from(variableValues.keys()),
    );

    // If no value found, return empty string (remove the placeholder)
    return "";
  });

  // Restore checkbox groups
  console.log(
    `🔄 Restoring ${checkboxGroupPlaceholders.length} checkbox groups`,
  );
  checkboxGroupPlaceholders.forEach((checkboxGroup, index) => {
    const placeholderPattern = new RegExp(`__CHECKBOX_GROUP_${index}__`, "g");
    const beforeReplace = processed.includes(`__CHECKBOX_GROUP_${index}__`);
    processed = processed.replace(placeholderPattern, checkboxGroup);
    const afterReplace = processed.includes(checkboxGroup.substring(0, 100));
    console.log(
      `  Group ${index}: placeholder found=${beforeReplace}, restored=${afterReplace}`,
    );
  });

  // Debug: Verify checkbox groups are in final output
  const finalHasCheckboxGroups = processed.includes(
    'data-variable-type="checkbox_group"',
  );
  console.log(
    `✅ Final processed HTML contains checkbox groups: ${finalHasCheckboxGroups}`,
  );

  return processed;
}
