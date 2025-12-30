import React, { useEffect, useState, useCallback } from 'react'
import './PageRender.css'
import './EditorContentStyles.css'

interface PageRendererProps {
    content: string
    headers: HeaderFooterConfig
    footers: HeaderFooterConfig
}


export interface HeaderFooterItem {
    content: string
    height?: number // Height in pixels, defaults to 40 if not specified
}

export interface HeaderFooterConfig {
    left: HeaderFooterItem | string // Support both old string format and new object format
    center: HeaderFooterItem | string
    right: HeaderFooterItem | string
}

// Helper functions to normalize config
export const getHeaderFooterContent = (item: HeaderFooterItem | string | undefined): string => {
    if (!item) return ''
    if (typeof item === 'string') return item
    return item.content || ''
}

export const getHeaderFooterHeight = (item: HeaderFooterItem | string | undefined): number => {
    if (!item) return 40
    if (typeof item === 'string') return 40
    return item.height || 40
}

export interface EditorState {
    content: string
    headers: HeaderFooterConfig
    footers: HeaderFooterConfig
}

export interface PageInfo {
    pageNumber: number
    totalPages: number
    content: string
    height: number
}


const PageRenderer: React.FC<PageRendererProps> = ({ content, headers: _headers, footers: _footers }) => {
    const [pages, setPages] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // A4 dimensions at 96 DPI (standard web DPI)
    // A4 = 210mm × 297mm = 794px × 1123px at 96 DPI
    const A4_WIDTH_PX = 794
    const A4_HEIGHT_PX = 1123

    // Account for page margins (40px left + 40px right = 80px total horizontal)
    const PAGE_MARGIN_HORIZONTAL = 80
    const PAGE_MARGIN_VERTICAL = 80 // 40px top + 40px bottom

    // Available content area
    const CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_MARGIN_HORIZONTAL
    const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - PAGE_MARGIN_VERTICAL

    // Display dimensions for preview (responsive while maintaining aspect ratio)
    // Use the calculated A4 height to ensure consistency
    const PAGE_HEIGHT = `${A4_HEIGHT_PX}px` // 1123px - true A4 height

    /**
     * Wait for all fonts to load
     */
    const waitForFonts = useCallback(async (): Promise<void> => {
        await document.fonts.ready
    }, [])

    /**
     * Wait for all images in an element to load
     */
    const waitForImages = useCallback(async (element: HTMLElement): Promise<void> => {
        const images = Array.from(element.querySelectorAll('img'))
        await Promise.all(
            images.map(img => {
                if (img.complete) return Promise.resolve()
                return new Promise<void>((resolve) => {
                    img.onload = () => resolve()
                    img.onerror = () => resolve() // Continue even if image fails
                })
            })
        )
    }, [])

    /**
     * Process images in HTML content:
     * 1. Convert width/height attributes to inline styles
     * 2. Scale down oversized images to fit within page content area
     */
    const processImageAttributes = (html: string): string => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html

        // Process all images to convert width/height attributes to inline styles
        const images = tempDiv.querySelectorAll('img')
        images.forEach(img => {
            const widthAttr = img.getAttribute('width')
            const heightAttr = img.getAttribute('height')
            const styleWidth = img.style.width
            const styleHeight = img.style.height

            // Parse current dimensions
            const width = styleWidth || (widthAttr ? `${widthAttr}px` : null)
            const height = styleHeight || (heightAttr ? `${heightAttr}px` : null)

            // Parse pixel values
            let widthPx = width ? parseFloat(width) : null
            let heightPx = height ? parseFloat(height) : null

            // Scale down if image is taller than content area
            if (heightPx && heightPx > CONTENT_HEIGHT_PX) {
                const scale = CONTENT_HEIGHT_PX / heightPx
                heightPx = CONTENT_HEIGHT_PX
                if (widthPx) {
                    widthPx = widthPx * scale
                }
            }

            // Scale down if image is wider than content area
            if (widthPx && widthPx > CONTENT_WIDTH_PX) {
                const scale = CONTENT_WIDTH_PX / widthPx
                widthPx = CONTENT_WIDTH_PX
                if (heightPx) {
                    heightPx = heightPx * scale
                }
            }

            // Build new style
            let newStyle = img.getAttribute('style') || ''

            // Remove existing width/height from style
            newStyle = newStyle.replace(/width\s*:\s*[^;]+;?/gi, '')
            newStyle = newStyle.replace(/height\s*:\s*[^;]+;?/gi, '')
            newStyle = newStyle.replace(/max-width\s*:\s*[^;]+;?/gi, '')
            newStyle = newStyle.replace(/max-height\s*:\s*[^;]+;?/gi, '')

            // Apply dimensions
            if (widthPx) {
                newStyle += `width: ${widthPx}px; `
            }
            if (heightPx) {
                newStyle += `height: ${heightPx}px; `
            }

            // Always add max constraints to prevent overflow
            newStyle += `max-width: 100%; max-height: ${CONTENT_HEIGHT_PX}px; object-fit: contain; `

            img.setAttribute('style', newStyle.trim())
        })

        return tempDiv.innerHTML
    }

    // Note: Currently unused as headers/footers are disabled in the UI
    // Kept for future use when headers/footers are re-enabled
    const _renderHeaderFooter = (item: string | { content: string; height?: number }, pageNumber: number, totalPages: number) => {
        const html = getHeaderFooterContent(item)
        if (!html) return ''

        // Create a temporary div to parse HTML and replace placeholders
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html

        // Replace placeholders in text nodes
        const replaceInNode = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent || ''
                text = text.replace(/{page}/g, pageNumber.toString())
                text = text.replace(/{total}/g, totalPages.toString())
                node.textContent = text
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element
                // Replace in attributes (like alt text, title, etc.)
                Array.from(element.attributes).forEach(attr => {
                    if (attr.value.includes('{page}') || attr.value.includes('{total}')) {
                        let value = attr.value
                        value = value.replace(/{page}/g, pageNumber.toString())
                        value = value.replace(/{total}/g, totalPages.toString())
                        element.setAttribute(attr.name, value)
                    }
                })
                // Recursively process child nodes
                Array.from(node.childNodes).forEach(child => replaceInNode(child))
            }
        }

        Array.from(tempDiv.childNodes).forEach(node => replaceInNode(node))

        // Process images to convert attributes to inline styles
        let processedHtml = tempDiv.innerHTML
        processedHtml = processImageAttributes(processedHtml)

        return processedHtml
    }

    /**
     * Measures the actual height of an element including all its content
     * Properly handles images, tables, and other complex elements
     * Uses getBoundingClientRect for accurate layout-aware measurement
     * Note: Kept for potential future use with individual element measurement
     */
    const _measureElementHeight = useCallback((element: HTMLElement, container: HTMLElement): number => {
        // Clone the element to measure it in isolation
        const clone = element.cloneNode(true) as HTMLElement
        container.appendChild(clone)

        // Process images: apply dimensions and scale oversized images
        const images = clone.querySelectorAll('img')
        images.forEach(img => {
            // Get dimensions from style, width/height attributes, or natural dimensions
            const widthAttr = img.style.width || img.getAttribute('width')
            const heightAttr = img.style.height || img.getAttribute('height')

            const width = widthAttr ? (widthAttr.includes('px') ? widthAttr : `${widthAttr}px`) : null
            const height = heightAttr ? (heightAttr.includes('px') ? heightAttr : `${heightAttr}px`) : null

            // Apply dimensions
            if (width) img.style.width = width
            if (height) img.style.height = height

            // If no dimensions specified, use natural dimensions with max-width constraint
            if (!width && !height) {
                img.style.width = 'auto'
                img.style.maxWidth = '100%'
            }

            // CRITICAL: Scale down images taller than page content area
            if (height) {
                const heightPx = parseFloat(height)
                if (heightPx > CONTENT_HEIGHT_PX) {
                    const scale = CONTENT_HEIGHT_PX / heightPx
                    img.style.height = `${CONTENT_HEIGHT_PX}px`
                    if (width) {
                        const widthPx = parseFloat(width)
                        img.style.width = `${widthPx * scale}px`
                    }
                }
            }
        })

        // Ensure tables have proper layout
        const tables = clone.querySelectorAll('table')
        tables.forEach(table => {
            const htmlTable = table as HTMLElement
            htmlTable.style.width = '100%'
            htmlTable.style.borderCollapse = 'collapse'
        })

        // Use getBoundingClientRect for precise layout-aware measurement
        const rect = clone.getBoundingClientRect()
        const height = rect.height

        container.removeChild(clone)
        return height
    }, [CONTENT_HEIGHT_PX])

    /**
     * Splits a table into multiple tables by rows, preserving thead on each page
     * Returns an array of table HTML strings
     */
    const splitTableIntoPages = useCallback((
        table: HTMLTableElement,
        measurementContainer: HTMLElement,
        availableHeight: number
    ): string[] => {
        const thead = table.querySelector('thead')
        const tbody = table.querySelector('tbody')

        if (!tbody) {
            // No tbody, treat as single block
            return [table.outerHTML]
        }

        const rows = Array.from(tbody.querySelectorAll('tr'))
        if (rows.length === 0) {
            return [table.outerHTML]
        }

        // Measure thead height
        let theadHeight = 0
        if (thead) {
            const theadClone = thead.cloneNode(true) as HTMLElement
            const tempTable = document.createElement('table')
            tempTable.style.width = '100%'
            tempTable.style.borderCollapse = 'collapse'
            tempTable.appendChild(theadClone)
            measurementContainer.appendChild(tempTable)
            theadHeight = tempTable.getBoundingClientRect().height
            measurementContainer.removeChild(tempTable)
        }

        const tableTables: string[] = []
        let currentRows: HTMLTableRowElement[] = []
        let currentHeight = theadHeight

        for (const row of rows) {
            // Measure row height
            const rowClone = row.cloneNode(true) as HTMLTableRowElement
            const tempTbody = document.createElement('tbody')
            tempTbody.appendChild(rowClone)
            const tempTable = document.createElement('table')
            tempTable.style.width = '100%'
            tempTable.style.borderCollapse = 'collapse'
            tempTable.appendChild(tempTbody)
            measurementContainer.appendChild(tempTable)
            const rowHeight = tempTable.getBoundingClientRect().height
            measurementContainer.removeChild(tempTable)

            // Check if adding this row exceeds available height
            if (currentHeight + rowHeight > availableHeight && currentRows.length > 0) {
                // Create a new table with current rows
                const newTable = document.createElement('table')
                // Copy table attributes
                Array.from(table.attributes).forEach(attr => {
                    newTable.setAttribute(attr.name, attr.value)
                })

                if (thead) {
                    newTable.appendChild(thead.cloneNode(true))
                }

                const newTbody = document.createElement('tbody')
                currentRows.forEach(r => newTbody.appendChild(r.cloneNode(true)))
                newTable.appendChild(newTbody)

                tableTables.push(newTable.outerHTML)

                // Start new table with current row
                currentRows = [row]
                currentHeight = theadHeight + rowHeight
            } else {
                currentRows.push(row)
                currentHeight += rowHeight
            }
        }

        // Add remaining rows as final table
        if (currentRows.length > 0) {
            const newTable = document.createElement('table')
            Array.from(table.attributes).forEach(attr => {
                newTable.setAttribute(attr.name, attr.value)
            })

            if (thead) {
                newTable.appendChild(thead.cloneNode(true))
            }

            const newTbody = document.createElement('tbody')
            currentRows.forEach(r => newTbody.appendChild(r.cloneNode(true)))
            newTable.appendChild(newTbody)

            tableTables.push(newTable.outerHTML)
        }

        return tableTables
    }, [])

    /**
     * Measures cumulative height of elements in a container
     * This accounts for margin collapsing between adjacent elements
     */
    const measureCumulativeHeight = (elements: HTMLElement[], container: HTMLElement): number => {
        // Clear container
        container.innerHTML = ''

        // Add all elements to container
        elements.forEach(el => {
            container.appendChild(el.cloneNode(true))
        })

        // Measure total height including margins
        const height = container.scrollHeight

        // Clear container
        container.innerHTML = ''

        return height
    }

    /**
     * Splits content into pages while preserving HTML structure
     * Properly accounts for images, tables, and all other elements
     * Uses cumulative measurement to handle margin collapsing correctly
     */
    const splitContentIntoPages = useCallback(async (): Promise<string[]> => {
        if (!content) {
            return []
        }

        // Create a measurement container with proper A4 dimensions
        // CRITICAL: Must match exact same styles as .page-content for accurate measurement
        const measurementContainer = document.createElement('div')
        measurementContainer.style.width = `${CONTENT_WIDTH_PX}px`
        measurementContainer.style.position = 'absolute'
        measurementContainer.style.visibility = 'hidden'
        measurementContainer.style.left = '-9999px'
        measurementContainer.style.top = '-9999px'
        measurementContainer.className = 'page-content' // Apply same CSS class for consistent styling
        document.body.appendChild(measurementContainer)

        try {
            // First, split by manual page breaks
            const contentParts = content.split('<div class="page-break"></div>')
            const pages: string[] = []

            for (const part of contentParts) {
                if (!part.trim()) continue

                // Parse the HTML content
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = part.trim()

                // Get all top-level children as an array
                const children = Array.from(tempDiv.children) as HTMLElement[]

                if (children.length === 0) {
                    // If no children (plain text), wrap in a div and add as page
                    if (part.trim()) {
                        pages.push(part.trim())
                    }
                    continue
                }

                // Process elements using cumulative measurement
                let currentPageElements: HTMLElement[] = []

                for (let i = 0; i < children.length; i++) {
                    const child = children[i]

                    // Special handling for tables that need to be split
                    if (child.tagName === 'TABLE') {
                        // Measure table height
                        const tableHeight = measureCumulativeHeight([child], measurementContainer)

                        // If table is taller than page, split it by rows
                        if (tableHeight > CONTENT_HEIGHT_PX) {
                            // Save current page content before handling table
                            if (currentPageElements.length > 0) {
                                const pageDiv = document.createElement('div')
                                currentPageElements.forEach(el => pageDiv.appendChild(el.cloneNode(true)))
                                pages.push(pageDiv.innerHTML)
                                currentPageElements = []
                            }

                            // Split table across multiple pages
                            const tableParts = splitTableIntoPages(
                                child as HTMLTableElement,
                                measurementContainer,
                                CONTENT_HEIGHT_PX
                            )

                            // Add each table part as its own page
                            tableParts.forEach(tablePart => {
                                pages.push(tablePart)
                            })

                            continue
                        }
                    }

                    // Try adding this element to current page
                    const testElements = [...currentPageElements, child]
                    const testHeight = measureCumulativeHeight(testElements, measurementContainer)

                    if (testHeight > CONTENT_HEIGHT_PX && currentPageElements.length > 0) {
                        // Current page is full, save it
                        const pageDiv = document.createElement('div')
                        currentPageElements.forEach(el => pageDiv.appendChild(el.cloneNode(true)))
                        pages.push(pageDiv.innerHTML)

                        // Start new page with current element
                        currentPageElements = [child]

                        // Check if single element exceeds page height
                        const singleHeight = measureCumulativeHeight([child], measurementContainer)
                        if (singleHeight > CONTENT_HEIGHT_PX) {
                            // Element is too tall, add it as its own page (will be clipped)
                            const pageDiv = document.createElement('div')
                            pageDiv.appendChild(child.cloneNode(true))
                            pages.push(pageDiv.innerHTML)
                            currentPageElements = []
                        }
                    } else {
                        // Element fits, add to current page
                        currentPageElements.push(child)
                    }
                }

                // Add remaining content as the last page
                if (currentPageElements.length > 0) {
                    const pageDiv = document.createElement('div')
                    currentPageElements.forEach(el => pageDiv.appendChild(el.cloneNode(true)))
                    pages.push(pageDiv.innerHTML)
                }
            }

            // If no pages were created, create at least one page
            if (pages.length === 0 && content.trim()) {
                pages.push(content.trim())
            }

            return pages
        } finally {
            // Clean up measurement container
            document.body.removeChild(measurementContainer)
        }
    }, [content, CONTENT_WIDTH_PX, CONTENT_HEIGHT_PX, splitTableIntoPages])

    // Process page content to convert image width/height attributes to inline styles
    const processPageContent = (html: string): string => {
        return processImageAttributes(html)
    }

    // Effect to perform pagination when content changes
    // Handles async font and image loading for deterministic results
    useEffect(() => {
        let cancelled = false

        const performPagination = async () => {
            if (!content || !content.trim()) {
                setPages([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)

            try {
                // Wait for fonts to load (Rule 3: Measurement timing)
                await waitForFonts()

                // Wait for images in content to load
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = content
                await waitForImages(tempDiv)

                // Perform pagination
                const newPages = await splitContentIntoPages()

                if (!cancelled) {
                    setPages(newPages)
                    setIsLoading(false)
                }
            } catch (error) {
                console.error('Pagination error:', error)
                if (!cancelled) {
                    setPages([])
                    setIsLoading(false)
                }
            }
        }

        performPagination()

        return () => {
            cancelled = true
        }
    }, [content, splitContentIntoPages, waitForFonts, waitForImages])

    return (
        <div className="page-renderer">
            <h3 className="preview-heading">
                Page Preview (A4 Layout) - {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                {isLoading && ' (Loading...)'}
            </h3>

            <div className="pages-container">
                {pages.map((pageContent, index) => {
                    // Process all header/footer text with placeholders
                    //   const headerLeft = renderHeaderFooter(headers.left, index + 1, pages.length)
                    //   const headerCenter = renderHeaderFooter(headers.center, index + 1, pages.length)
                    //   const headerRight = renderHeaderFooter(headers.right, index + 1, pages.length)
                    //   const footerLeft = renderHeaderFooter(footers.left, index + 1, pages.length)
                    //   const footerCenter = renderHeaderFooter(footers.center, index + 1, pages.length)
                    //   const footerRight = renderHeaderFooter(footers.right, index + 1, pages.length)

                    //   // Get configured heights (use the maximum height from all three positions)
                    //   const headerHeightLeft = getHeaderFooterHeight(headers.left)
                    //   const headerHeightCenter = getHeaderFooterHeight(headers.center)
                    //   const headerHeightRight = getHeaderFooterHeight(headers.right)
                    //   const headerHeight = Math.max(headerHeightLeft, headerHeightCenter, headerHeightRight)

                    //   const footerHeightLeft = getHeaderFooterHeight(footers.left)
                    //   const footerHeightCenter = getHeaderFooterHeight(footers.center)
                    //   const footerHeightRight = getHeaderFooterHeight(footers.right)
                    //   const footerHeight = Math.max(footerHeightLeft, footerHeightCenter, footerHeightRight)

                    //   const contentTop = headerHeight
                    //   const contentBottom = footerHeight

                    return (
                        <div
                            key={index}
                            className="page"
                            style={{
                                width: '100%',
                                maxWidth: `${A4_WIDTH_PX}px`,
                                height: PAGE_HEIGHT,
                                overflow: 'hidden',
                                scrollSnapAlign: 'start',
                                scrollSnapStop: 'always'
                            }}
                        >
                            {/* Header */}
                            {/* <div
                className="page-header"
                style={{ height: `${headerHeight}px`, maxHeight: `${headerHeight}px` }}
              >
                <div className="header-left" dangerouslySetInnerHTML={{ __html: headerLeft }} />
                <div className="header-center" dangerouslySetInnerHTML={{ __html: headerCenter }} />
                <div className="header-right" dangerouslySetInnerHTML={{ __html: headerRight }} />
              </div> */}

                            {/* Page Content */}
                            <div
                                className="page-content"
                                style={{
                                    width: 'calc(100% - 80px)',
                                    height: `${CONTENT_HEIGHT_PX}px`,
                                    margin: '0',
                                    padding: '0',
                                    position: 'absolute',
                                    top: '40px',
                                    left: '40px',
                                    right: '40px',
                                    bottom: '40px',
                                    overflow: 'hidden', // No scrollbars - content must fit within page
                                    overflowWrap: 'break-word'
                                }}
                                dangerouslySetInnerHTML={{ __html: processPageContent(pageContent) }}
                            />

                            {/* Footer */}
                            {/* <div
                className="page-footer"
                style={{ height: `${footerHeight}px`, maxHeight: `${footerHeight}px` }}
              >
                <div className="footer-left" dangerouslySetInnerHTML={{ __html: footerLeft }} />
                <div className="footer-center" dangerouslySetInnerHTML={{ __html: footerCenter }} />
                <div className="footer-right" dangerouslySetInnerHTML={{ __html: footerRight }} />
              </div>
 */}
                            {/* Page Number Indicator */}
                            {/* <div className="page-number-indicator">
                Page {index + 1} of {pages.length}
              </div> */}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default PageRenderer
