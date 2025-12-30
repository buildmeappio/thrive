import React, { useEffect, useState, useCallback } from 'react'
import './PageRender.css'
import './EditorContentStyles.css'
import type { HeaderConfig, FooterConfig } from './types'
import {
    shouldShowHeader,
    shouldShowFooter,
    processPlaceholders,
} from './types'

interface PageRendererProps {
    content: string
    header?: HeaderConfig
    footer?: FooterConfig
}

export interface PageInfo {
    pageNumber: number
    totalPages: number
    content: string
    height: number
}


const PageRenderer: React.FC<PageRendererProps> = ({ content, header, footer }) => {
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
     * Temporarily attaches images to DOM to ensure proper loading
     */
    const waitForImages = useCallback(async (element: HTMLElement): Promise<void> => {
        const images = Array.from(element.querySelectorAll('img'))
        if (images.length === 0) return

        // Create a temporary container to attach images to DOM
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.visibility = 'hidden'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '-9999px'
        document.body.appendChild(tempContainer)

        try {
            // Clone and attach images to DOM for proper loading
            const imagePromises = images.map(img => {
                if (img.complete) return Promise.resolve()

                // Clone the image and attach to DOM
                const clonedImg = img.cloneNode(true) as HTMLImageElement
                tempContainer.appendChild(clonedImg)

                return new Promise<void>((resolve) => {
                    clonedImg.onload = () => {
                        tempContainer.removeChild(clonedImg)
                        resolve()
                    }
                    clonedImg.onerror = () => {
                        tempContainer.removeChild(clonedImg)
                        resolve() // Continue even if image fails
                    }
                })
            })

            await Promise.all(imagePromises)
        } finally {
            // Clean up temporary container
            if (tempContainer.parentNode) {
                document.body.removeChild(tempContainer)
            }
        }
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
     * Uses getBoundingClientRect for accurate layout-aware measurement
     */
    const measureCumulativeHeight = (elements: HTMLElement[], container: HTMLElement): number => {
        // Clear container
        container.innerHTML = ''

        // Add all elements to container
        elements.forEach(el => {
            container.appendChild(el.cloneNode(true))
        })

        // Measure total height using getBoundingClientRect for accurate layout-aware measurement
        const rect = container.getBoundingClientRect()
        const height = rect.height

        // Clear container
        container.innerHTML = ''

        return height
    }

    /**
     * Calculate the minimum available content height across all pages.
     * This accounts for header/footer heights to ensure content fits on any page.
     * We use a conservative approach: assume header and footer are always present
     * to ensure content will fit regardless of which page it lands on.
     */
    const getMinAvailableHeight = useCallback((): number => {
        // Get the maximum header/footer heights that could appear on any page
        const headerHeight = header ? (header.height || 40) : 0
        const footerHeight = footer ? (footer.height || 40) : 0
        return CONTENT_HEIGHT_PX - headerHeight - footerHeight
    }, [header, footer, CONTENT_HEIGHT_PX])

    /**
     * Splits content into pages while preserving HTML structure
     * Properly accounts for images, tables, and all other elements
     * Uses cumulative measurement to handle margin collapsing correctly
     * Now accounts for header/footer heights when calculating available space
     */
    const splitContentIntoPages = useCallback(async (): Promise<string[]> => {
        if (!content) {
            return []
        }

        // Create a measurement container with proper A4 dimensions
        // CRITICAL: Must match exact same styles as .page-content for accurate measurement
        // Explicitly match render wrapping and allow natural height
        const measurementContainer = document.createElement('div')
        measurementContainer.style.width = `${CONTENT_WIDTH_PX}px`

        measurementContainer.style.position = 'static'  // key
        measurementContainer.style.top = 'auto'
        measurementContainer.style.left = 'auto'
        measurementContainer.style.right = 'auto'
        measurementContainer.style.bottom = 'auto'
        measurementContainer.style.height = 'auto'
        measurementContainer.style.maxHeight = 'none'
        measurementContainer.style.overflow = 'visible'
        measurementContainer.style.height = 'auto' // Allow natural height
        measurementContainer.style.position = 'absolute'
        measurementContainer.style.visibility = 'hidden'
        measurementContainer.style.left = '-9999px'
        measurementContainer.style.top = '-9999px'
        measurementContainer.style.overflow = 'visible' // Allow natural overflow
        measurementContainer.style.overflowWrap = 'break-word' // Match render wrapping
        measurementContainer.style.whiteSpace = 'normal' // Match render wrapping
        measurementContainer.style.boxSizing = 'border-box' // Match render box model
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
                // Use minimum available height (accounting for header/footer) for all pages
                // This ensures content fits regardless of which page it lands on
                const availableHeight = getMinAvailableHeight()

                for (let i = 0; i < children.length; i++) {
                    const child = children[i]

                    // Special handling for tables that need to be split
                    if (child.tagName === 'TABLE') {
                        // Measure table height
                        const tableHeight = measureCumulativeHeight([child], measurementContainer)

                        // If table is taller than available page height, split it by rows
                        if (tableHeight > availableHeight) {
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
                                availableHeight
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

                    if (testHeight > availableHeight && currentPageElements.length > 0) {
                        // Current page is full, save it
                        const pageDiv = document.createElement('div')
                        currentPageElements.forEach(el => pageDiv.appendChild(el.cloneNode(true)))
                        pages.push(pageDiv.innerHTML)

                        // Start new page with current element
                        currentPageElements = [child]

                        // Check if single element exceeds available height
                        const singleHeight = measureCumulativeHeight([child], measurementContainer)
                        if (singleHeight > availableHeight) {
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
    }, [content, CONTENT_WIDTH_PX, splitTableIntoPages, getMinAvailableHeight])

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

                const tempDiv = document.createElement('div')
                tempDiv.style.position = 'absolute'
                tempDiv.style.visibility = 'hidden'
                tempDiv.style.left = '-9999px'
                tempDiv.style.top = '0'
                tempDiv.innerHTML = content
                document.body.appendChild(tempDiv)

                await waitForImages(tempDiv)

                document.body.removeChild(tempDiv)

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
    }, [content, header, footer, splitContentIntoPages, waitForFonts, waitForImages])

    return (
        <div className="page-renderer">
            <h3 className="preview-heading">
                Page Preview (A4 Layout) - {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                {isLoading && ' (Loading...)'}
            </h3>

            <div className="pages-container">
                {pages.map((pageContent, index) => {
                    const pageNumber = index + 1
                    const totalPages = pages.length

                    // Check if header/footer should be shown based on frequency
                    const showHeader = shouldShowHeader(header, pageNumber)
                    const showFooter = shouldShowFooter(footer, pageNumber)

                    // Get heights
                    const headerHeight = showHeader ? (header?.height || 40) : 0
                    const footerHeight = showFooter ? (footer?.height || 40) : 0

                    // Process header/footer content with placeholders
                    const headerContent = showHeader && header
                        ? processPlaceholders(header.content, pageNumber, totalPages)
                        : ''
                    const footerContent = showFooter && footer
                        ? processPlaceholders(footer.content, pageNumber, totalPages)
                        : ''

                    // Calculate content area positioning
                    const contentTop = headerHeight + 40 // 40px top margin + header height
                    const contentBottom = footerHeight + 40 // 40px bottom margin + footer height
                    const contentAreaHeight = CONTENT_HEIGHT_PX - headerHeight - footerHeight

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
                                scrollSnapStop: 'always',
                                position: 'relative'
                            }}
                        >
                            {/* Header - Full width single section */}
                            {showHeader && (
                                <div
                                    className="page-header"
                                    style={{
                                        height: `${headerHeight}px`,
                                        maxHeight: `${headerHeight}px`,
                                        width: '100%',
                                        padding: '0 40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 1
                                    }}
                                >
                                    <div
                                        className="header-content"
                                        style={{ width: '100%' }}
                                        dangerouslySetInnerHTML={{ __html: headerContent }}
                                    />
                                </div>
                            )}

                            {/* Page Content */}
                            <div
                                className="page-content"
                                style={{
                                    width: 'calc(100% - 80px)',
                                    height: `${contentAreaHeight}px`,
                                    margin: '0',
                                    padding: '0',
                                    position: 'absolute',
                                    top: `${contentTop}px`,
                                    left: '40px',
                                    right: '40px',
                                    bottom: `${contentBottom}px`,
                                    overflow: 'hidden', // No scrollbars - content must fit within page
                                    overflowWrap: 'break-word'
                                }}
                                dangerouslySetInnerHTML={{ __html: processPageContent(pageContent) }}
                            />

                            {/* Footer - Full width single section */}
                            {showFooter && (
                                <div
                                    className="page-footer"
                                    style={{
                                        height: `${footerHeight}px`,
                                        maxHeight: `${footerHeight}px`,
                                        width: '100%',
                                        padding: '0 40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        zIndex: 1
                                    }}
                                >
                                    <div
                                        className="footer-content"
                                        style={{ width: '100%' }}
                                        dangerouslySetInnerHTML={{ __html: footerContent }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default PageRenderer
