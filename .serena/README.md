# Serena MCP Configuration for Next.js 16

## Overview
This folder contains the Serena MCP configuration for the blog-personal-nextjs project.

## What's Included

### `project.yml`
Serena project-level configuration file that optimizes the coding agent for Next.js 16 development.

## Key Features

1. **Next.js 16 Optimized**
   - App Router support
   - TypeScript strict mode
   - TailwindCSS integration

2. **Context-Aware Settings**
   - IDE assistant mode for efficient coding
   - Memory persistence for context continuity
   - Read-write mode enabled (customizable)

3. **File Patterns**
   - Includes: src/**, app/**, components/**, lib/**, hooks/**
   - Excludes: .next/, node_modules/, .git/

4. **Build Commands**
   - Build: `npm run build`
   - Dev: `npm run dev`
   - TypeCheck: `npm run lint`
   - Format: `npm run format`

## Usage

The `.serena` folder is automatically detected by Serena MCP server. To activate this project:

1. Start the development server: `npm run dev`
2. Serena will automatically detect and activate this project
3. The configuration will optimize code analysis and editing for Next.js 16

## Customization

Edit `project.yml` to customize:
- `excluded_tools`: Disable specific tools for security
- `read_only: true`: Enable read-only mode
- `ls_specific_settings`: Customize language server behavior
- `files.include/exclude`: Adjust file patterns

## Next.js 16 + Serena Integration

This configuration leverages:
- **Next.js MCP Server**: Real-time application introspection
- **Serena Semantic Tools**: Symbol-based code navigation
- **Context7 MCP**: Documentation lookup
- **Tavily MCP**: Web research capabilities

## Best Practices

1. Run `npm run lint` before committing
2. Use Serena's symbolic tools for safe refactoring
3. Leverage memory persistence for complex tasks
4. Combine with next-devtools for comprehensive debugging

## Resources

- [Serena Documentation](https://github.com/oraios/serena)
- [Next.js 16 MCP Guide](https://nextjs.org/docs/app/guides/mcp)
- [Context7 MCP](https://github.com/upstash/context7-mcp)
