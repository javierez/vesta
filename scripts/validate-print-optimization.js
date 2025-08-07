#!/usr/bin/env node
/**
 * Print Layout Validation Script
 * Tests the print optimization implementation for templates
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for output formatting
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ValidationResult {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.details = [];
  }

  pass(message) {
    this.passed++;
    this.details.push(`${colors.green}✓${colors.reset} ${message}`);
  }

  fail(message) {
    this.failed++;
    this.details.push(`${colors.red}✗${colors.reset} ${message}`);
  }

  warn(message) {
    this.warnings++;
    this.details.push(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  summary() {
    const total = this.passed + this.failed;
    const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\n${colors.bold}=== VALIDATION SUMMARY ===${colors.reset}`);
    console.log(`Tests: ${colors.green}${this.passed} passed${colors.reset}, ${colors.red}${this.failed} failed${colors.reset}, ${colors.yellow}${this.warnings} warnings${colors.reset}`);
    console.log(`Pass Rate: ${passRate >= 80 ? colors.green : passRate >= 60 ? colors.yellow : colors.red}${passRate}%${colors.reset}`);
    
    this.details.forEach(detail => console.log(detail));
    
    return this.failed === 0;
  }
}

// Test files to validate
const testFiles = [
  'src/lib/carteleria/print-constants.ts',
  'src/lib/carteleria/print-utils.ts',
  'src/components/admin/carteleria/templates/classic/classic-template.tsx',
  'src/components/admin/carteleria/templates/classic/features-grid.tsx'
];

/**
 * Test 1: Validate print constants are properly defined
 */
function testPrintConstants(result) {
  console.log(`\n${colors.blue}${colors.bold}Testing Print Constants...${colors.reset}`);
  
  try {
    const constantsPath = join(__dirname, 'src/lib/carteleria/print-constants.ts');
    const content = readFileSync(constantsPath, 'utf-8');
    
    // Check A4 dimensions
    if (content.includes('width: 794') && content.includes('height: 1123')) {
      result.pass('A4 dimensions correctly defined (794x1123px)');
    } else {
      result.fail('A4 dimensions not properly defined');
    }
    
    // Check print constants exist
    const requiredConstants = [
      'PRINT_DIMENSIONS',
      'getDimensionsForOrientation',
      'getTypographySize',
      'OVERLAY',
      'TYPOGRAPHY',
      'ICONS',
      'SPACING'
    ];
    
    requiredConstants.forEach(constant => {
      if (content.includes(constant)) {
        result.pass(`Print constant '${constant}' is defined`);
      } else {
        result.fail(`Print constant '${constant}' is missing`);
      }
    });
    
  } catch (error) {
    result.fail(`Failed to read print-constants.ts: ${error.message}`);
  }
}

/**
 * Test 2: Validate responsive patterns are removed (exclude validation utilities)
 */
function testResponsivePatterns(result) {
  console.log(`\n${colors.blue}${colors.bold}Testing Responsive Pattern Removal...${colors.reset}`);
  
  const responsivePatterns = [
    { pattern: /\b(sm|md|lg|xl|2xl):[a-zA-Z-]+/g, name: 'Responsive breakpoint classes' },
    { pattern: /\b(w-full|h-full|w-screen|h-screen)\b/g, name: 'Full dimension classes' },
    { pattern: /aspect-\[[^\]]+\]/g, name: 'Aspect ratio utilities' },
    { pattern: /(rem|em|vh|vw)(?![a-zA-Z])/g, name: 'Responsive units' }
  ];
  
  testFiles.forEach(filePath => {
    try {
      const fullPath = join(__dirname, filePath);
      const content = readFileSync(fullPath, 'utf-8');
      
      // Skip validation patterns in print-utils.ts
      if (filePath.includes('print-utils.ts')) {
        result.pass(`Skipping responsive pattern check for ${filePath} (contains validation utilities)`);
        return;
      }
      
      responsivePatterns.forEach(({ pattern, name }) => {
        // Exclude content within validation patterns and comments
        let cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments  
        cleanContent = cleanContent.replace(/\/\/.*$/gm, ''); // Remove line comments
        cleanContent = cleanContent.replace(/const.*PATTERNS.*=[\s\S]*?};/g, ''); // Remove pattern definitions
        
        const matches = cleanContent.match(pattern);
        if (matches && matches.length > 0) {
          const uniqueMatches = [...new Set(matches)];
          if (uniqueMatches.length <= 2 && !filePath.includes('template')) {
            result.warn(`Few ${name} found in ${filePath}: ${uniqueMatches.join(', ')}`);
          } else if (uniqueMatches.length > 2) {
            result.fail(`Multiple ${name} found in ${filePath}: ${uniqueMatches.slice(0, 3).join(', ')}... (${uniqueMatches.length} total)`);
          } else {
            result.warn(`Few ${name} found in ${filePath}: ${uniqueMatches.join(', ')}`);
          }
        } else {
          result.pass(`No ${name} found in ${filePath}`);
        }
      });
      
    } catch (error) {
      result.fail(`Failed to read ${filePath}: ${error.message}`);
    }
  });
}

/**
 * Test 3: Validate fixed pixel dimensions usage
 */
function testFixedDimensions(result) {
  console.log(`\n${colors.blue}${colors.bold}Testing Fixed Dimension Usage...${colors.reset}`);
  
  testFiles.forEach(filePath => {
    try {
      const fullPath = join(__dirname, filePath);
      const content = readFileSync(fullPath, 'utf-8');
      
      // Count pixel usage
      const pixelMatches = content.match(/\d+px/g);
      const pxCount = pixelMatches ? pixelMatches.length : 0;
      
      // Count print dimension usage
      const printDimMatches = content.match(/PRINT_DIMENSIONS\./g);
      const printDimCount = printDimMatches ? printDimMatches.length : 0;
      
      if (pxCount > 0) {
        result.pass(`${filePath} uses ${pxCount} fixed pixel values`);
      } else {
        result.warn(`${filePath} has no fixed pixel values`);
      }
      
      if (printDimCount > 0) {
        result.pass(`${filePath} uses ${printDimCount} print dimension constants`);
      } else if (filePath.includes('template')) {
        result.fail(`${filePath} should use print dimension constants`);
      }
      
    } catch (error) {
      result.fail(`Failed to read ${filePath}: ${error.message}`);
    }
  });
}

/**
 * Test 4: Validate print styles and media queries
 */
function testPrintStyles(result) {
  console.log(`\n${colors.blue}${colors.bold}Testing Print Styles...${colors.reset}`);
  
  try {
    const templatePath = join(__dirname, 'src/components/admin/carteleria/templates/classic/classic-template.tsx');
    const content = readFileSync(templatePath, 'utf-8');
    
    // Check for print media queries
    if (content.includes('@media print')) {
      result.pass('Print media queries are present');
    } else {
      result.fail('Print media queries are missing');
    }
    
    // Check for print-specific properties
    const printProperties = [
      'color-adjust: exact',
      'print-color-adjust: exact',
      'page-break-inside: avoid',
      'break-inside: avoid'
    ];
    
    printProperties.forEach(property => {
      if (content.includes(property)) {
        result.pass(`Print property '${property}' is used`);
      } else {
        result.warn(`Print property '${property}' not found`);
      }
    });
    
    // Check for print styles injection
    if (content.includes('injectPrintStyles')) {
      result.pass('Print styles injection is implemented');
    } else {
      result.fail('Print styles injection is missing');
    }
    
  } catch (error) {
    result.fail(`Failed to test print styles: ${error.message}`);
  }
}

/**
 * Test 5: Validate template structure
 */
function testTemplateStructure(result) {
  console.log(`\n${colors.blue}${colors.bold}Testing Template Structure...${colors.reset}`);
  
  try {
    const templatePath = join(__dirname, 'src/components/admin/carteleria/templates/classic/classic-template.tsx');
    const content = readFileSync(templatePath, 'utf-8');
    
    // Check for required structural elements
    const requiredElements = [
      'containerDimensions',
      'getDimensionsForOrientation',
      'getTypographySize',
      'safeData',
      'position: "absolute"',
      'zIndex:'
    ];
    
    requiredElements.forEach(element => {
      if (content.includes(element)) {
        result.pass(`Template structure includes '${element}'`);
      } else {
        result.fail(`Template structure missing '${element}'`);
      }
    });
    
    // Check for inline styles over className usage
    const inlineStyleCount = (content.match(/style=\{\{/g) || []).length;
    const classNameCount = (content.match(/className=/g) || []).length;
    
    if (inlineStyleCount > classNameCount) {
      result.pass(`Template favors inline styles (${inlineStyleCount}) over className (${classNameCount}) for print optimization`);
    } else {
      result.warn(`Template uses more className (${classNameCount}) than inline styles (${inlineStyleCount})`);
    }
    
  } catch (error) {
    result.fail(`Failed to test template structure: ${error.message}`);
  }
}

/**
 * Main validation function
 */
async function validatePrintOptimization() {
  console.log(`${colors.bold}${colors.blue}🔍 Print Layout Validation${colors.reset}`);
  console.log(`${colors.blue}Testing print optimization for PDF generation...${colors.reset}`);
  
  const result = new ValidationResult();
  
  // Run all tests
  testPrintConstants(result);
  testResponsivePatterns(result);
  testFixedDimensions(result);
  testPrintStyles(result);
  testTemplateStructure(result);
  
  // Show summary and return success status
  const success = result.summary();
  
  console.log(`\n${colors.bold}${success ? colors.green + '✅ Print optimization validation PASSED' : colors.red + '❌ Print optimization validation FAILED'}${colors.reset}`);
  
  if (!success) {
    console.log(`\n${colors.yellow}💡 Fix the failed tests above to ensure proper print optimization.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${colors.green}🎉 All tests passed! The template is ready for high-quality PDF generation.${colors.reset}`);
}

// Run validation
validatePrintOptimization().catch(error => {
  console.error(`${colors.red}❌ Validation failed with error:${colors.reset}`, error);
  process.exit(1);
});