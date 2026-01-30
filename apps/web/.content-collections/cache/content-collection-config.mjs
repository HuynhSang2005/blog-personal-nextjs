// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { codeImport } from "remark-code-import";
import { visit as visit2 } from "unist-util-visit";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { z } from "zod";

// src/lib/core/utils/rehype-npm-command.ts
import { visit } from "unist-util-visit";
function rehypeNpmCommand() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "element" || node?.tagName !== "pre") {
        return;
      }
      if (node.properties?.__rawString__?.startsWith("npm i")) {
        const npmCommand = node.properties?.__rawString__;
        node.properties.__npmCommand__ = npmCommand;
        node.properties.__yarnCommand__ = npmCommand.replace(
          "npm i",
          "yarn add"
        );
        node.properties.__pnpmCommand__ = npmCommand.replace(
          "npm i",
          "pnpm add"
        );
        node.properties.__bunCommand__ = npmCommand.replace("npm i", "bun add");
      }
      if (node.properties?.__rawString__?.startsWith("npx create-")) {
        const npmCommand = node.properties?.__rawString__;
        node.properties.__npmCommand__ = npmCommand;
        node.properties.__yarnCommand__ = npmCommand.replace(
          "npx create-",
          "yarn create "
        );
        node.properties.__pnpmCommand__ = npmCommand.replace(
          "npx create-",
          "pnpm create "
        );
        node.properties.__bunCommand__ = npmCommand.replace("npx", "bunx --bun");
      }
      if (node.properties?.__rawString__?.startsWith("npx") && !node.properties?.__rawString__?.startsWith("npx create-")) {
        const npmCommand = node.properties?.__rawString__;
        node.properties.__npmCommand__ = npmCommand;
        node.properties.__yarnCommand__ = npmCommand;
        node.properties.__pnpmCommand__ = npmCommand.replace("npx", "pnpm dlx");
        node.properties.__bunCommand__ = npmCommand.replace("npx", "bunx --bun");
      }
    });
  };
}

// src/lib/core/utils/code-theme.ts
import { createHighlighter } from "shiki";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// src/config/code-theme.ts
var localCodeThemes = ["Aura Theme"];
var codeThemeConfig = {
  theme: localCodeThemes[0],
  localThemes: localCodeThemes,
  languages: ["txt", "json", "bash", "diff", "markdown", "typescript"]
};

// src/lib/core/utils/to-kebab-case.ts
function toKebabCase(text) {
  return text.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}

// src/lib/core/utils/code-theme.ts
var localThemes = codeThemeConfig.localThemes;
function getContentLayerCodeTheme() {
  const themeName = codeThemeConfig.theme;
  if (localCodeThemes.includes(themeName)) {
    return JSON.parse(
      readFileSync(
        resolve(
          `./src/styles/themes/syntax-highlight/${toKebabCase(themeName)}.json`
        ),
        "utf-8"
      )
    );
  }
  return codeThemeConfig.theme;
}

// src/config/blog.ts
var blogConfig = {
  mainNav: [
    {
      href: "/blog",
      title: {
        vi: "Blog"
      }
    }
  ],
  authors: [
    {
      /* the id property must be the same as author_id in the blog post mdx files required for the computed field
        in contentlayer.config.ts so we can get the author details from the blogConfig by comparing the author_id
        with the id below
      */
      id: "huynhsang",
      name: "Hu\u1EF3nh Sang",
      image: "/authors/huynhsang.jpg",
      site: "https://github.com/HuynhSang2005",
      email: "huynhsang2005@example.com",
      bio: {
        vi: "L\u1EADp tr\xECnh vi\xEAn | Ng\u01B0\u1EDDi y\xEAu c\xF4ng ngh\u1EC7 | Blogger"
      },
      social: {
        github: "HuynhSang2005",
        twitter: "@huynhsang",
        youtube: "huynhsang",
        linkedin: "huynhsang"
      }
    }
  ],
  rss: [
    {
      type: "xml",
      file: "blog.xml",
      contentType: "application/xml"
    },
    {
      type: "json",
      file: "blog.json",
      contentType: "application/json"
    }
  ]
};

// content-collections.ts
var docs = defineCollection({
  name: "docs",
  directory: "../content/docs",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    links: z.object({
      doc: z.string().optional(),
      blog: z.string().optional(),
      api: z.string().optional(),
      source: z.string().optional()
    }).optional(),
    toc: z.boolean().default(true)
  }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc, {
      remarkPlugins: [remarkGfm, codeImport],
      rehypePlugins: [
        rehypeSlug,
        () => (tree) => {
          visit2(tree, (node) => {
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
            onVisitLine(node) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            onVisitHighlightedLine(node) {
              node?.properties?.className?.push("line--highlighted");
            },
            onVisitHighlightedChars(node) {
              node.properties.className = ["word--highlighted"];
            }
          }
        ],
        () => (tree) => {
          visit2(tree, (node) => {
            if (node?.type === "element" && !!node?.tagName) {
              const preElement = node?.children?.at(-1);
              if (preElement?.tagName !== "pre") {
                return;
              }
              preElement.properties["__withMeta__"] = node?.children?.at(0)?.tagName === "div";
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
              className: ["subheading-anchor"]
            }
          }
        ]
      ]
    });
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
        contentType: "mdx"
      },
      body: {
        raw: doc.content,
        code: mdx
      }
    };
  }
});
var blogs = defineCollection({
  name: "blogs",
  directory: "../content/blog",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    author_id: z.string().optional(),
    og_image: z.string().optional(),
    links: z.object({
      doc: z.string().optional(),
      blog: z.string().optional(),
      api: z.string().optional(),
      source: z.string().optional()
    }).optional(),
    tags: z.array(z.string())
  }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc, {
      remarkPlugins: [remarkGfm, codeImport],
      rehypePlugins: [
        rehypeSlug,
        () => (tree) => {
          visit2(tree, (node) => {
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
            onVisitLine(node) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            onVisitHighlightedLine(node) {
              node?.properties?.className?.push("line--highlighted");
            },
            onVisitHighlightedChars(node) {
              node.properties.className = ["word--highlighted"];
            }
          }
        ],
        () => (tree) => {
          visit2(tree, (node) => {
            if (node?.type === "element" && !!node?.tagName) {
              const preElement = node?.children?.at(-1);
              if (preElement?.tagName !== "pre") {
                return;
              }
              preElement.properties["__withMeta__"] = node?.children?.at(0)?.tagName === "div";
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
              className: ["subheading-anchor"]
            }
          }
        ]
      ]
    });
    const pathParts = doc._meta.path.split("/");
    const slugAsParams = pathParts.slice(1).join("/");
    const wordsPerMinute = 200;
    const numberOfWords = doc.content.trim().split(/\s+/).length;
    const readTimeInMinutes = Math.ceil(numberOfWords / wordsPerMinute);
    const [, locale] = doc._meta.directory.split("/");
    const authorData = blogConfig.authors.find(
      (author2) => author2.id === doc.author_id
    );
    const author = authorData ? {
      ...authorData,
      bio: authorData.bio?.[locale] || authorData.bio?.vi
    } : { id: doc.author_id };
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
        contentType: "mdx"
      },
      body: {
        raw: doc.content,
        code: mdx
      }
    };
  }
});
var content_collections_default = defineConfig({
  collections: [docs, blogs]
});
export {
  content_collections_default as default
};
