"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
    NodeViewWrapper,
    ReactNodeViewRenderer,
    ReactNodeViewProps,
} from "@tiptap/react";
import React from "react";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        tickBox: {
            setTickBox: (options: {
                label?: string;
                tickBoxId?: string;
                checked?: boolean;
                group?: string;
            }) => ReturnType;
            setTickBoxGroup: (options: {
                labels: string[];
                group?: string;
            }) => ReturnType;
            toggleTickBox: () => ReturnType;
        };
    }
}

const TickBoxComponent: React.FC<ReactNodeViewProps> = ({
    node,
    updateAttributes,
    editor,
    getPos,
}) => {
    const attrs = node.attrs as {
        label: string;
        tickBoxId: string;
        checked: boolean;
        group: string;
    };

    const handleClick = () => {
        if (!editor.isEditable) return;

        const pos = getPos();
        if (typeof pos !== "number") return;

        const { state } = editor;
        const { doc } = state;

        // If checking this box, uncheck all others in the same group
        if (!attrs.checked && attrs.group) {
            const positionsToUpdate: number[] = [];

            doc.descendants((node, nodePos) => {
                if (
                    node.type.name === "tickBox" &&
                    nodePos !== pos &&
                    node.attrs.group === attrs.group &&
                    node.attrs.checked
                ) {
                    positionsToUpdate.push(nodePos);
                }
            });

            // Update all other tick boxes in the group in a single transaction
            if (positionsToUpdate.length > 0) {
                editor.commands.command(({ tr }) => {
                    positionsToUpdate.forEach((nodePos) => {
                        const node = doc.nodeAt(nodePos);
                        if (node) {
                            tr.setNodeMarkup(nodePos, undefined, {
                                ...node.attrs,
                                checked: false,
                            });
                        }
                    });
                    return true;
                });
            }
        }

        updateAttributes({
            checked: !attrs.checked,
        });
    };

    return (
        <NodeViewWrapper className="tick-box-node-view" as="span">
            <span className="tick-box-container">
                <span
                    className="tick-box"
                    data-checked={attrs.checked ? "true" : "false"}
                    data-tick-box-id={attrs.tickBoxId}
                    data-group={attrs.group || ""}
                    onClick={handleClick}
                    style={{
                        cursor: editor.isEditable ? "pointer" : "default",
                    }}
                />
                <span
                    className="tick-box-label"
                    style={{
                        cursor: editor.isEditable ? "pointer" : "default",
                    }}
                    onClick={handleClick}
                >
                    {attrs.label}
                </span>
            </span>
        </NodeViewWrapper>
    );
};

export default Node.create({
    name: "tickBox",

    group: "inline",
    inline: true,
    atom: true,

    addAttributes() {
        return {
            label: {
                default: "Tick Box",
                parseHTML: (element) => {
                    const labelEl = element.querySelector(".tick-box-label");
                    return labelEl?.textContent || "Tick Box";
                },
                renderHTML: (_attributes) => {
                    return {};
                },
            },
            tickBoxId: {
                default: `tick-box-${Date.now()}`,
                parseHTML: (element) => {
                    const tickBoxEl = element.querySelector(".tick-box");
                    return tickBoxEl?.getAttribute("data-tick-box-id") || `tick-box-${Date.now()}`;
                },
                renderHTML: (_attributes) => {
                    return {};
                },
            },
            checked: {
                default: false,
                parseHTML: (element) => {
                    const tickBoxEl = element.querySelector(".tick-box");
                    return tickBoxEl?.getAttribute("data-checked") === "true";
                },
                renderHTML: (_attributes) => {
                    return {};
                },
            },
            group: {
                default: "",
                parseHTML: (element) => {
                    const tickBoxEl = element.querySelector(".tick-box");
                    return tickBoxEl?.getAttribute("data-group") || "";
                },
                renderHTML: (_attributes) => {
                    return {};
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span.tick-box-container',
                getAttrs: (element) => {
                    if (typeof element === "string") return false;
                    const tickBoxEl = element.querySelector(".tick-box");
                    const labelEl = element.querySelector(".tick-box-label");

                    return {
                        tickBoxId: tickBoxEl?.getAttribute("data-tick-box-id") || `tick-box-${Date.now()}`,
                        checked: tickBoxEl?.getAttribute("data-checked") === "true",
                        label: labelEl?.textContent || "Tick Box",
                        group: tickBoxEl?.getAttribute("data-group") || "",
                    };
                },
            },
            {
                tag: 'div.tick-box-container',
                getAttrs: (element) => {
                    if (typeof element === "string") return false;
                    const tickBoxEl = element.querySelector(".tick-box");
                    const labelEl = element.querySelector(".tick-box-label");

                    return {
                        tickBoxId: tickBoxEl?.getAttribute("data-tick-box-id") || `tick-box-${Date.now()}`,
                        checked: tickBoxEl?.getAttribute("data-checked") === "true",
                        label: labelEl?.textContent || "Tick Box",
                        group: tickBoxEl?.getAttribute("data-group") || "",
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const attrs = node.attrs as {
            label: string;
            tickBoxId: string;
            checked: boolean;
            group: string;
        };

        return [
            "span",
            mergeAttributes(HTMLAttributes, { class: "tick-box-container" }),
            [
                "span",
                {
                    class: "tick-box",
                    "data-checked": attrs.checked ? "true" : "false",
                    "data-tick-box-id": attrs.tickBoxId,
                    "data-group": attrs.group || "",
                },
            ],
            ["span", { class: "tick-box-label" }, attrs.label],
        ];
    },

    addCommands() {
        return {
            setTickBox:
                (options: { label?: string; tickBoxId?: string; checked?: boolean; group?: string }) =>
                    ({ commands }) => {
                        const tickBoxId = options.tickBoxId || `tick-box-${Date.now()}`;
                        const label = options.label || "Tick Box";
                        const checked = options.checked || false;
                        const group = options.group || "";

                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                label,
                                tickBoxId,
                                checked,
                                group,
                            },
                        });
                    },
            setTickBoxGroup:
                (options: { labels: string[]; group?: string }) =>
                    ({ commands }) => {
                        const group = options.group || `tick-group-${Date.now()}`;
                        const labels = options.labels.filter((l) => l.trim());

                        if (labels.length === 0) return false;

                        const tickBoxes = labels.map((label, index) => ({
                            type: this.name,
                            attrs: {
                                label: label.trim(),
                                tickBoxId: `${group}-${index}`,
                                checked: false,
                                group,
                            },
                        }));

                        // Insert tick boxes with spaces between them
                        const content: any[] = [];
                        tickBoxes.forEach((tickBox, index) => {
                            content.push(tickBox);
                            if (index < tickBoxes.length - 1) {
                                content.push({ type: "text", text: " " });
                            }
                        });

                        return commands.insertContent(content);
                    },
            toggleTickBox:
                () =>
                    ({ chain, state }) => {
                        const { selection } = state;
                        const { $from } = selection;
                        const node = $from.node();

                        if (node.type.name === this.name) {
                            const attrs = node.attrs as { checked: boolean };
                            return chain()
                                .updateAttributes(this.name, {
                                    checked: !attrs.checked,
                                })
                                .run();
                        }

                        return false;
                    },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(TickBoxComponent);
    },
});

