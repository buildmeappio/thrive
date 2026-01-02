/**
 * Splits a table into multiple tables by rows, preserving thead on each page
 * Returns an array of table HTML strings
 */
export function splitTableIntoPages(
  table: HTMLTableElement,
  measurementContainer: HTMLElement,
  availableHeight: number,
): string[] {
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  if (!tbody) {
    // No tbody, treat as single block
    return [table.outerHTML];
  }

  const rows = Array.from(tbody.querySelectorAll("tr"));
  if (rows.length === 0) {
    return [table.outerHTML];
  }

  // Measure thead height
  let theadHeight = 0;
  if (thead) {
    const theadClone = thead.cloneNode(true) as HTMLElement;
    const tempTable = document.createElement("table");
    tempTable.style.width = "100%";
    tempTable.style.borderCollapse = "collapse";
    tempTable.appendChild(theadClone);
    measurementContainer.appendChild(tempTable);
    theadHeight = tempTable.getBoundingClientRect().height;
    measurementContainer.removeChild(tempTable);
  }

  const tableTables: string[] = [];
  let currentRows: HTMLTableRowElement[] = [];
  let currentHeight = theadHeight;

  for (const row of rows) {
    // Measure row height
    const rowClone = row.cloneNode(true) as HTMLTableRowElement;
    const tempTbody = document.createElement("tbody");
    tempTbody.appendChild(rowClone);
    const tempTable = document.createElement("table");
    tempTable.style.width = "100%";
    tempTable.style.borderCollapse = "collapse";
    tempTable.appendChild(tempTbody);
    measurementContainer.appendChild(tempTable);
    const rowHeight = tempTable.getBoundingClientRect().height;
    measurementContainer.removeChild(tempTable);

    // Check if adding this row exceeds available height
    if (
      currentHeight + rowHeight > availableHeight &&
      currentRows.length > 0
    ) {
      // Create a new table with current rows
      const newTable = document.createElement("table");
      // Copy table attributes
      Array.from(table.attributes).forEach((attr) => {
        newTable.setAttribute(attr.name, attr.value);
      });

      if (thead) {
        newTable.appendChild(thead.cloneNode(true));
      }

      const newTbody = document.createElement("tbody");
      currentRows.forEach((r) => newTbody.appendChild(r.cloneNode(true)));
      newTable.appendChild(newTbody);

      tableTables.push(newTable.outerHTML);

      // Start new table with current row
      currentRows = [row];
      currentHeight = theadHeight + rowHeight;
    } else {
      currentRows.push(row);
      currentHeight += rowHeight;
    }
  }

  // Add remaining rows as final table
  if (currentRows.length > 0) {
    const newTable = document.createElement("table");
    Array.from(table.attributes).forEach((attr) => {
      newTable.setAttribute(attr.name, attr.value);
    });

    if (thead) {
      newTable.appendChild(thead.cloneNode(true));
    }

    const newTbody = document.createElement("tbody");
    currentRows.forEach((r) => newTbody.appendChild(r.cloneNode(true)));
    newTable.appendChild(newTbody);

    tableTables.push(newTable.outerHTML);
  }

  return tableTables;
}

