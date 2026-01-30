import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypePrettyCode, { type Options } from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { codeImport } from "remark-code-import";
import { visit } from "unist-util-visit";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { z } from "zod";

import type { BlogConfig } from "./src/lib/core/types/blog";
import { rehypeNpmCommand } from "./src/lib/core/utils/rehype-npm-command";
import { getContentLayerCodeTheme } from "./src/lib/core/utils/code-theme";
import { blogConfig } from "./src/config/blog";

// =============================================================================
// DOCS COLLECTION
// =============================================================================

const docs = defineCollection({
  name: "docs",
  directory: "../content/docs",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    links: z
      .object({
        doc: z.string().optional(),
        blog: z.string().optional(),
        api: z.string().optional(),
        source: z.string().optional(),
      })
      .optional(),
    toc: z.boolean().default(true),
  }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc, {
      remarkPlugins: [remarkGfm, codeImport],
      rehypePlugins: [
        rehypeSlug,
        () => (tree: any) => {
          visit(tree, (node: any) => {
            if (node?.type === "element" && node?.tagName === "pre") {
              const [codeEl] = node.children;
              if (codeEl.tagName !== "code") {
                return;
              }

              node.__rawString__ = codeEl.children?.[0]?.value;
              node.__src__ = node.properties?.__src__;
              node.__style__ = node.properties?.__style__;
            }
          });
        },
        [
          rehypePrettyCode,
          {
            keepBackground: false,
            theme: getContentLayerCodeTheme(),

            onVisitLine(node: any) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },

            onVisitHighlightedLine(node: any) {
              node?.properties?.className?.push("line--highlighted");
            },

            onVisitHighlightedChars(node: any) {
              node.properties.className = ["word--highlighted"];
            },
          } as Options,
        ],
        () => (tree: any) => {
          visit(tree, (node: any) => {
            if (node?.type === "element" && !!node?.tagName) {
              const preElement = node?.children?.at(-1);

              if (preElement?.tagName !== "pre") {
                return;
              }

              preElement.properties["__withMeta__"] =
                node?.children?.at(0)?.tagName === "div";

              preElement.properties["__rawString__"] = node?.__rawString__;

              if (node?.__src__) {
                preElement.properties["__src__"] = node.__src__;
              }

              if (node?.__style__) {
                preElement.properties["__style__"] = node.__style__;
              }
            }
          });
        },
        rehypeNpmCommand,
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              ariaLabel: "Link to section",
              className: ["subheading-anchor"],
            },
          },
        ],
      ],
    });

    // Generate slug from file path
    const pathParts = doc._meta.path.split("/");
    const slugAsParams = pathParts.slice(1).join("/");

    return {
      ...doc,
      mdx,
      slug: `/${doc._meta.path}`,
      slugAsParams,
      // Compatibility with old Contentlayer structure
      _id: doc._meta.filePath,
      _raw: {
        sourceFilePath: doc._meta.filePath,
        sourceFileName: doc._meta.fileName,
        sourceFileDir: doc._meta.directory,
        flattenedPath: doc._meta.path,
        contentType: "mdx" as const,
      },
      body: {
        raw: doc.content,
        code: mdx,
      },
    };
  },
});

// =============================================================================
// BLOG COLLECTION
// =============================================================================

const blogs = defineCollection({
  name: "blogs",
  directory: "../content/blog",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    author_id: z.string().optional(),
    og_image: z.string().optional(),
    links: z
      .object({
        doc: z.string().optional(),
        blog: z.string().optional(),
        api: z.string().optional(),
        source: z.string().optional(),
      })
      .optional(),
    tags: z.array(z.string()),
  }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc, {
      remarkPlugins: [remarkGfm, codeImport],
      rehypePlugins: [
        rehypeSlug,
        () => (tree: any) => {
          visit(tree, (node: any) => {
            if (node?.type === "element" && node?.tagName === "pre") {
              const [codeEl] = node.children;
              if (codeEl.tagName !== "code") {
                return;
              }

              node.__rawString__ = codeEl.children?.[0]?.value;
              node.__src__ = node.properties?.__src__;
              node.__style__ = node.properties?.__style__;
            }
          });
        },
        [
          rehypePrettyCode,
          {
            keepBackground: false,
            theme: getContentLayerCodeTheme(),

            onVisitLine(node: any) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },

            onVisitHighlightedLine(node: any) {
              node?.properties?.className?.push("line--highlighted");
            },

            onVisitHighlightedChars(node: any) {
              node.properties.className = ["word--highlighted"];
            },
          } as Options,
        ],
        () => (tree: any) => {
          visit(tree, (node: any) => {
            if (node?.type === "element" && !!node?.tagName) {
              const preElement = node?.children?.at(-1);

              if (preElement?.tagName !== "pre") {
                return;
              }

              preElement.properties["__withMeta__"] =
                node?.children?.at(0)?.tagName === "div";

              preElement.properties["__rawString__"] = node?.__rawString__;

              if (node?.__src__) {
                preElement.properties["__src__"] = node.__src__;
              }

              if (node?.__style__) {
                preElement.properties["__style__"] = node.__style__;
              }
            }
          });
        },
        rehypeNpmCommand,
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              ariaLabel: "Link to section",
              className: ["subheading-anchor"],
            },
          },
        ],
      ],
    });

    // Generate slug from file path
    const pathParts = doc._meta.path.split("/");
    const slugAsParams = pathParts.slice(1).join("/");

    // Calculate read time
    const wordsPerMinute = 200;
    const numberOfWords = doc.content.trim().split(/\s+/).length;
    const readTimeInMinutes = Math.ceil(numberOfWords / wordsPerMinute);

    // Get author info
    const [, locale] = doc._meta.directory.split("/");
    const authorData = blogConfig.authors.find(
      (author) => author.id === doc.author_id
    );

    const author: Partial<BlogConfig["authors"][number]> & { bio?: string } =
      authorData
        ? {
            ...authorData,
            bio:
              authorData.bio?.[locale as keyof typeof authorData.bio] ||
              authorData.bio?.vi,
          }
        : { id: doc.author_id };

    return {
      ...doc,
      mdx,
      slug: `/${doc._meta.path}`,
      slugAsParams,
      readTimeInMinutes,
      author,
      // Compatibility with old Contentlayer structure
      _id: doc._meta.filePath,
      _raw: {
        sourceFilePath: doc._meta.filePath,
        sourceFileName: doc._meta.fileName,
        sourceFileDir: doc._meta.directory,
        flattenedPath: doc._meta.path,
        contentType: "mdx" as const,
      },
      body: {
        raw: doc.content,
        code: mdx,
      },
    };
  },
});

// =============================================================================
// EXPORT CONFIG
// =============================================================================

export default defineConfig({
  collections: [docs, blogs],
});
