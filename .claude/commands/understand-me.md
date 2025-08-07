# Understand and Fill Template

Understand a feature request, research the codebase, and create comprehensive documentation using the provided template.

## Feature Request: $ARGUMENTS

## Process

1. **Understand the Request**
   - Read and analyze the feature request thoroughly
   - Identify key components and requirements
   - Ask clarifying questions if anything is unclear
   - Understand the scope and goals

2. **Codebase Research**
   - Search for relevant existing code patterns
   - Look for similar implementations or features
   - Check the `public/examples/` folder for reference materials
   - Identify integration points and dependencies
   - Find existing documentation patterns

3. **Fill Template**
   - Use the following template structure:
   
   ```markdown
   ## FEATURE:
   
   [Insert your feature here]
   
   ## EXAMPLES:
   
   [Provide and explain examples that you have in the `public/examples/` folder]
   
   ## DOCUMENTATION:
   
   [List out any documentation (web pages, sources for an MCP server like Crawl4AI RAG, etc.) that will need to be referenced during development]
   
   ## OTHER CONSIDERATIONS:
   
   [Any other considerations or specific requirements - great place to include gotchas that you see AI coding assistants miss with your projects a lot]
   ```

4. **Create Documentation File**
   - Generate a descriptive filename based on the feature (e.g., `feature-name.md`)
   - Fill the template with comprehensive information
   - Include specific examples from the codebase
   - Reference actual documentation URLs
   - Add implementation gotchas and considerations
   - Ensure the documentation is actionable and complete

## Template Guidelines

- **FEATURE**: Be specific and detailed about what needs to be built
- **EXAMPLES**: Reference actual files in `public/examples/` and explain their relevance
- **DOCUMENTATION**: Include specific URLs and sections that will be needed
- **OTHER CONSIDERATIONS**: Include setup requirements, gotchas, and project-specific patterns

## Output

Save as: `{descriptive-feature-name}.md`

The goal is to create comprehensive documentation that provides all context needed for successful implementation.