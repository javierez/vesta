# Google Maps Platform MCP Server

## Overview

The Google Maps Platform Code Assist toolkit is an MCP (Model Context Protocol) server that enhances AI assistants like Claude Code with real-time access to Google Maps Platform documentation and expertise.

## What is MCP?

**Model Context Protocol (MCP)** is a standardized way for AI assistants to access external tools and data sources. Think of it as a plugin system that allows Claude Code to connect to specialized knowledge bases and services.

## Purpose

Converts your AI assistant into a **Google Maps Platform expert** by providing:
- Real-time access to official Google Maps documentation
- Up-to-date API specifications and best practices
- Official code examples from Google's repositories
- Current service terms and security guidelines

## Installation

### Method 1: Quick CLI Install (Recommended)

```bash
claude mcp add google-maps-platform-code-assist -- npx -y @googlemaps/code-assist-mcp@latest
```

### Method 2: Manual Configuration

1. Open or create `~/.claude.json` in your home directory
2. Add this configuration:

```json
{
  "mcpServers": {
    "google-maps-platform-code-assist": {
      "command": "npx",
      "args": [
        "-y",
        "@googlemaps/code-assist-mcp@latest"
      ]
    }
  }
}
```

### Verify Installation

```bash
claude mcp list
```

You should see `google-maps-platform-code-assist` in the output.

## Requirements

- **Node.js** (LTS version recommended)
- **npm** installed
- Compatible MCP client (Claude Code, Cursor, Android Studio, etc.)
- No API key required for the MCP server itself

## How It Works: The Two Tools

The MCP server provides Claude Code with two specialized tools that work together:

### 1. `retrieve-instructions` - The Strategy Tool

**Purpose:** Helps the AI understand how to interpret Google Maps-related requests

**What it does:**
- Provides system instructions for processing user intent
- Guides how to formulate effective documentation queries
- Acts as a "training manual" for Google Maps problem-solving

**Example:**
When you say "add a map to show property locations", this tool helps Claude understand:
- You likely need the Maps JavaScript API
- Documentation on map initialization is needed
- Marker placement and customization should be considered
- Multiple markers might require clustering

### 2. `retrieve-google-maps-platform-docs` - The Knowledge Tool

**Purpose:** Searches and retrieves official Google Maps Platform documentation

**What it does:**
- Uses **RAG (Retrieval Augmented Generation)** technology
- Takes natural language queries
- Searches through comprehensive sources:
  - Official Google Maps Platform documentation
  - Code samples from Google's GitHub repositories
  - Service Terms and API policies
  - Trust Center security guidelines
- Returns the most relevant, up-to-date information

**Example Query:**
```
"How to initialize Google Maps JavaScript API with custom markers"
```

**Returns:**
- Current API initialization code
- Marker customization options
- Best practices for performance
- Security considerations

## How The Tools Work Together

### Example Workflow

**User Request:** "Help me add a map showing all my properties"

```
┌─────────────────────────────────────────┐
│ Step 1: retrieve-instructions           │
├─────────────────────────────────────────┤
│ Understands:                            │
│ - User needs Maps JavaScript API        │
│ - Multiple markers required             │
│ - Possibly need marker clustering       │
│ - Consider map initialization           │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Step 2: retrieve-google-maps-platform-  │
│         docs (multiple searches)        │
├─────────────────────────────────────────┤
│ Query 1: "Maps JavaScript API init"     │
│ Query 2: "Adding multiple markers"      │
│ Query 3: "Marker clustering"            │
│ Query 4: "Custom marker icons"          │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Step 3: Claude generates accurate code  │
├─────────────────────────────────────────┤
│ - Uses latest API version               │
│ - Follows current best practices        │
│ - Includes official code patterns       │
│ - Considers performance & security      │
└─────────────────────────────────────────┘
```

## Key Benefits

### Without MCP Server
- ❌ Relies on Claude's training data (potentially outdated)
- ❌ May use deprecated API patterns
- ❌ Misses new features released after training
- ❌ Generic implementation advice

### With MCP Server
- ✅ Access to **latest API versions**
- ✅ Uses **current best practices**
- ✅ Gets **official code examples**
- ✅ Knows about **new features**
- ✅ Understands **up-to-date pricing and limits**
- ✅ Follows **current security guidelines**

## Use Cases for Vesta

### Property Maps
```javascript
// Claude can help implement:
- Interactive property location maps
- Custom property markers with images
- Property clustering for dense areas
- Click handlers for property details
```

### Location Search
```javascript
// Claude can help implement:
- Geocoding property addresses
- Reverse geocoding (coordinates → addresses)
- Address autocomplete in property forms
- Location validation
```

### Neighborhood Features
```javascript
// Claude can help implement:
- Nearby amenities (schools, transport, shops)
- Area boundary visualization
- Distance calculations
- Points of interest markers
```

### Route Planning
```javascript
// Claude can help implement:
- Directions to properties
- Travel time estimates
- Multiple property tour routes
- Distance matrix for property comparisons
```

### Advanced Features
```javascript
// Claude can help implement:
- Custom map styling (brand colors)
- Drawing tools for area selection
- Heatmaps for property density
- Street View integration
- Polygon drawing for zones
```

## What Makes This Different

### Traditional Approach
```
User: "How do I add a map?"
Claude: Uses knowledge from training (possibly outdated)
Result: Code that might use old API versions
```

### With Google Maps MCP
```
User: "How do I add a map?"
Claude:
  1. Uses retrieve-instructions to understand context
  2. Queries retrieve-google-maps-platform-docs for latest info
  3. Gets current official documentation
Result: Code using the latest API version and best practices
```

## Technical Details

### RAG (Retrieval Augmented Generation)

The `retrieve-google-maps-platform-docs` tool uses RAG technology:

1. **Retrieval Phase:** Searches Google's documentation database
2. **Augmentation Phase:** Combines search results with the query context
3. **Generation Phase:** Claude uses this information to generate accurate responses

This ensures responses are:
- Factually accurate (from official sources)
- Up-to-date (from live documentation)
- Contextually relevant (matched to your specific need)

### Sources Accessed

- **Documentation:** All Google Maps Platform API docs
- **GitHub:** Official Google Maps code samples and repositories
- **Service Terms:** Current pricing, quotas, and usage policies
- **Trust Center:** Security and compliance guidelines
- **Release Notes:** Latest features and deprecations

## Best Practices

### When to Ask for Google Maps Help

Good requests that leverage the MCP server:
- "What's the latest way to initialize the Maps JavaScript API?"
- "How do I implement marker clustering in 2025?"
- "Show me current best practices for geocoding addresses"
- "What are the pricing considerations for using Places API?"

### Example Interactions

**Question:** "How do I add a map to my React component?"

**Claude's Process:**
1. Retrieves instructions on React + Google Maps patterns
2. Searches for latest React integration docs
3. Finds official examples from Google's GitHub
4. Generates code using current hooks and API patterns

**Question:** "What's the difference between Geocoding API and Places API?"

**Claude's Process:**
1. Retrieves official documentation for both APIs
2. Compares current features and pricing
3. Provides accurate, up-to-date comparison
4. Suggests appropriate use cases

## Troubleshooting

### MCP Server Not Working

Check installation:
```bash
claude mcp list
```

Should show:
```
google-maps-platform-code-assist
```

### Outdated Responses

If responses seem outdated:
1. Restart Claude Code
2. Verify MCP server is running: `claude mcp list`
3. Update to latest version: Re-run installation command

### Node.js Issues

Ensure you have Node.js LTS:
```bash
node --version
# Should be v18.x or v20.x (LTS)
```

## Future Capabilities

As Google Maps Platform evolves, the MCP server automatically provides access to:
- New API endpoints and features
- Updated pricing and quota information
- Deprecated feature warnings
- New code examples and patterns
- Security updates and best practices

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps)
- [MCP Official Site](https://modelcontextprotocol.io/)
- [Google Maps Platform MCP GitHub](https://github.com/googlemaps/code-assist-mcp)

## Summary

The Google Maps Platform MCP server transforms Claude Code from a general-purpose AI assistant into a specialized Google Maps expert with real-time access to official documentation. This ensures you always get accurate, up-to-date code and advice for implementing Google Maps features in your applications.

---

**Last Updated:** October 2024
**MCP Server Version:** @googlemaps/code-assist-mcp@latest
