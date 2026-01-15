import jwt, { SignOptions } from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "";
// const JWT_SET_PASSWORD_TOKEN_SECRET = process.env.JWT_SET_PASSWORD_TOKEN_SECRET || "";
// const JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET = process.env.JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET || "";
// const JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET = process.env.JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET || JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET;

// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be defined in environment variables");
// }

// if (!JWT_SET_PASSWORD_TOKEN_SECRET) {
//   throw new Error("JWT_SET_PASSWORD_TOKEN_SECRET must be defined in environment variables");
// }

// if (!JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET) {
//   throw new Error("JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET must be defined in environment variables");
// }

const getJwtSecret = (
  name:
    | "JWT_SET_PASSWORD_TOKEN_SECRET"
    | "JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET"
    | "JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET"
    | "JWT_CLAIMANT_APPROVE_TOKEN_SECRET"
    | "JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET"
    | "JWT_ORGANIZATION_INVITATION_TOKEN_SECRET"
    | "NEXTAUTH_SECRET",
) => {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`${name} secret must be defined in environment variables`);
  }
  return secret as string;
};

/**
 * Sign a token for password reset or account creation (uses PASSWORD_JWT_SECRET)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 7 days)
 * @returns Signed JWT token
 */
export function signAccountToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "7d",
): string {
  const options: SignOptions = { expiresIn };
  const JWT_SET_PASSWORD_TOKEN_SECRET = getJwtSecret(
    "JWT_SET_PASSWORD_TOKEN_SECRET",
  );
  return jwt.sign(payload, JWT_SET_PASSWORD_TOKEN_SECRET, options);
}

/**
 * Verify and decode a JWT token (uses PASSWORD_JWT_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyAccountToken(token: string): string | jwt.JwtPayload {
  try {
    const JWT_SET_PASSWORD_TOKEN_SECRET = getJwtSecret(
      "JWT_SET_PASSWORD_TOKEN_SECRET",
    );
    return jwt.verify(token, JWT_SET_PASSWORD_TOKEN_SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Sign a token for examiner resubmission (uses JWT_EXAMINATION_INFO_REQUEST_SECRET)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signExaminerResubmitToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "30d",
): string {
  const options: SignOptions = { expiresIn };
  const JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET = getJwtSecret(
    "JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET",
  );
  return jwt.sign(payload, JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET, options);
}

/**
 * Verify and decode an examiner resubmission token (uses JWT_EXAMINATION_INFO_REQUEST_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyExaminerResubmitToken(
  token: string,
): string | jwt.JwtPayload {
  try {
    const JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET = getJwtSecret(
      "JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET",
    );
    return jwt.verify(token, JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET);
  } catch {
    throw new Error("Invalid or expired resubmission token");
  }
}

/**
 * Sign a token for organization resubmission (uses JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signOrganizationResubmitToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "30d",
): string {
  const options: SignOptions = { expiresIn };
  const JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET = getJwtSecret(
    "JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET",
  );
  return jwt.sign(payload, JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET, options);
}

/**
 * Verify and decode an organization resubmission token (uses JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyOrganizationResubmitToken(
  token: string,
): string | jwt.JwtPayload {
  try {
    const JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET = getJwtSecret(
      "JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET",
    );
    return jwt.verify(token, JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET);
  } catch {
    throw new Error("Invalid or expired organization resubmission token");
  }
}

/**
 * Sign a token for claimant availability submission (uses JWT_CLAIMANT_APPROVE_TOKEN_SECRET)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signClaimantApproveToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "30d",
): string {
  const options: SignOptions = { expiresIn };
  const JWT_CLAIMANT_APPROVE_TOKEN_SECRET = getJwtSecret(
    "JWT_CLAIMANT_APPROVE_TOKEN_SECRET",
  );
  return jwt.sign(payload, JWT_CLAIMANT_APPROVE_TOKEN_SECRET, options);
}

/**
 * Verify and decode a claimant approval token (uses JWT_CLAIMANT_APPROVE_TOKEN_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyClaimantApproveToken(
  token: string,
): string | jwt.JwtPayload {
  try {
    const JWT_CLAIMANT_APPROVE_TOKEN_SECRET = getJwtSecret(
      "JWT_CLAIMANT_APPROVE_TOKEN_SECRET",
    );
    return jwt.verify(token, JWT_CLAIMANT_APPROVE_TOKEN_SECRET);
  } catch {
    throw new Error("Invalid or expired claimant approval token");
  }
}

/**
 * Sign a token for contract review/signing (uses JWT_SET_PASSWORD_TOKEN_SECRET)
 * @param payload - The data to encode in the token (should include contractId and optionally examinerProfileId or applicationId)
 * @param expiresIn - Token expiration time (default: 90 days)
 * @returns Signed JWT token
 */
export function signContractToken(
  payload: {
    contractId: string;
    examinerProfileId?: string;
    applicationId?: string;
  },
  expiresIn: SignOptions["expiresIn"] = "90d",
): string {
  const options: SignOptions = { expiresIn };
  const JWT_SET_PASSWORD_TOKEN_SECRET = getJwtSecret(
    "JWT_SET_PASSWORD_TOKEN_SECRET",
  );
  return jwt.sign(payload, JWT_SET_PASSWORD_TOKEN_SECRET, options);
}

/**
 * Verify and decode a contract token (uses JWT_SET_PASSWORD_TOKEN_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload with contractId and optionally examinerProfileId or applicationId
 */
export function verifyContractToken(token: string): {
  contractId: string;
  examinerProfileId?: string;
  applicationId?: string;
} {
  try {
    const JWT_SET_PASSWORD_TOKEN_SECRET = getJwtSecret(
      "JWT_SET_PASSWORD_TOKEN_SECRET",
    );
    const decoded = jwt.verify(
      token,
      JWT_SET_PASSWORD_TOKEN_SECRET,
    ) as jwt.JwtPayload;

    if (!decoded.contractId) {
      throw new Error("Invalid contract token payload");
    }

    return {
      contractId: decoded.contractId as string,
      examinerProfileId: decoded.examinerProfileId as string | undefined,
      applicationId: decoded.applicationId as string | undefined,
    };
  } catch {
    throw new Error("Invalid or expired contract token");
  }
}

/**
 * Sign a token for examiner application approval (uses JWT_SET_PASSWORD_TOKEN_SECRET)
 * @param payload - The data to encode in the token (should include email and applicationId)
 * @param expiresIn - Token expiration time (default: 7 days)
 * @returns Signed JWT token
 */
export function signExaminerApplicationToken(
  payload: { email: string; applicationId: string },
  expiresIn: SignOptions["expiresIn"] = "7d",
): string {
  const options: SignOptions = { expiresIn };
  const JWT_SET_PASSWORD_TOKEN_SECRET = getJwtSecret(
    "JWT_SET_PASSWORD_TOKEN_SECRET",
  );
  return jwt.sign(payload, JWT_SET_PASSWORD_TOKEN_SECRET, options);
}

/**
 * Verify and decode an examiner application token (uses JWT_SET_PASSWORD_TOKEN_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload with email and applicationId
 */
export function verifyExaminerApplicationToken(token: string): {
  email: string;
  applicationId: string;
} {
  try {
    const JWT_SET_PASSWORD_TOKEN_SECRET = getJwtSecret(
      "JWT_SET_PASSWORD_TOKEN_SECRET",
    );
    const decoded = jwt.verify(
      token,
      JWT_SET_PASSWORD_TOKEN_SECRET,
    ) as jwt.JwtPayload;

    if (!decoded.email || !decoded.applicationId) {
      throw new Error("Invalid application token payload");
    }

    return {
      email: decoded.email as string,
      applicationId: decoded.applicationId as string,
    };
  } catch {
    throw new Error("Invalid or expired application token");
  }
}

/**
 * Sign a token for examiner interview scheduling (uses JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET)
 * @param payload - The data to encode in the token (should include email and applicationId)
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signExaminerScheduleInterviewToken(
  payload: { email: string; applicationId: string },
  expiresIn: SignOptions["expiresIn"] = "30d",
): string {
  const options: SignOptions = { expiresIn };
  const JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET = getJwtSecret(
    "JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET",
  );
  return jwt.sign(
    payload,
    JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET,
    options,
  );
}

/**
 * Verify and decode an examiner interview scheduling token (uses JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload with email and applicationId
 */
export function verifyExaminerScheduleInterviewToken(token: string): {
  email: string;
  applicationId: string;
} {
  try {
    const JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET = getJwtSecret(
      "JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET",
    );
    const decoded = jwt.verify(
      token,
      JWT_EXAMINER_SCHEDULE_INTERVIEW_TOKEN_SECRET,
    ) as jwt.JwtPayload;

    if (!decoded.email || !decoded.applicationId) {
      throw new Error("Invalid interview scheduling token payload");
    }

    return {
      email: decoded.email as string,
      applicationId: decoded.applicationId as string,
    };
  } catch {
    throw new Error("Invalid or expired interview scheduling token");
  }
}

/**
 * Sign a token for organization invitation (uses JWT_ORGANIZATION_INVITATION_TOKEN_SECRET)
 * @param payload - The data to encode in the token (should include organizationId, email, invitationId)
 * @param expiresIn - Token expiration time (defaults to JWT_ORGANIZATION_INVITATION_TOKEN_EXPIRY env var or "7d")
 * @returns Signed JWT token
 */
export function signOrganizationInvitationToken(
  payload: {
    organizationId: string;
    email: string;
    invitationId: string;
  },
  expiresIn?: SignOptions["expiresIn"],
): string {
  const defaultExpiry =
    (process.env
      .JWT_ORGANIZATION_INVITATION_TOKEN_EXPIRY as SignOptions["expiresIn"]) ||
    "7d";
  const options: SignOptions = { expiresIn: expiresIn || defaultExpiry };
  const JWT_ORGANIZATION_INVITATION_TOKEN_SECRET = getJwtSecret(
    "JWT_ORGANIZATION_INVITATION_TOKEN_SECRET",
  );
  return jwt.sign(payload, JWT_ORGANIZATION_INVITATION_TOKEN_SECRET, options);
}

/**
 * Verify and decode an organization invitation token (uses JWT_ORGANIZATION_INVITATION_TOKEN_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload with organizationId, email, and invitationId
 */
export function verifyOrganizationInvitationToken(token: string): {
  organizationId: string;
  email: string;
  invitationId: string;
} {
  try {
    const JWT_ORGANIZATION_INVITATION_TOKEN_SECRET = getJwtSecret(
      "JWT_ORGANIZATION_INVITATION_TOKEN_SECRET",
    );
    const decoded = jwt.verify(
      token,
      JWT_ORGANIZATION_INVITATION_TOKEN_SECRET,
    ) as jwt.JwtPayload;

    if (!decoded.organizationId || !decoded.email || !decoded.invitationId) {
      throw new Error("Invalid organization invitation token payload");
    }

    return {
      organizationId: decoded.organizationId as string,
      email: decoded.email as string,
      invitationId: decoded.invitationId as string,
    };
  } catch {
    throw new Error("Invalid or expired organization invitation token");
  }
}
