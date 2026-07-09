# V1 Stratagem Analysis Plan

## Overview
Analysis of V1 command patterns across three ISCI projects to extract global command structure for V3 hybrid design.

## V1 Core Pattern Analysis

### Universal Commands Found Across All V1 Files

#### **PX (Preview-eXecute)**
- **Purpose**: Research/plan with MCP authority, present for approval
- **Key Characteristics**:
  - Default authorization for MCP during investigations
  - Full authority for research and bare metal implementation reading
  - Never ask permission for file reading or project research
  - Present plans without code walls
  - Use MCPs during PX mode

#### **AX (Approved-eXecute)**
- **Purpose**: Strict implementation of approved plans
- **Key Characteristics**:
  - Implement approved plan exactly
  - Add to TickTick, mark complete
  - Follow docs religiously - no creative additions
  - Ask before deviating from documented patterns
  - Respect design patterns
  - Stop introducing undocumented features

#### **CX (Chunk-eXamine)**
- **Purpose**: Analyze file size requirements and create strategic chunking plan
- **Key Characteristics**:
  - Analyze before implementing enterprise-grade services
  - Estimate lines, required chunks, execution strategy
  - Include token limits and chunking plan prefixed with 🪙
  - Plan for potential token depletion
  - Complete core functionality first

#### **CX AX (Combined Mode)**
- **Purpose**: Chunk-eXamine followed by Approved-eXecute
- **Implementation**: Sequential execution of CX then AX strategies

#### **IQ (Input Queue)**
- **Purpose**: MCP desktop-commander file-based communication
- **Pattern**: `{project-path}\zTemporaryFile.md`
- **Workflow**: Read file, consume contents, delete contents when done
- **Use Case**: Browser console output communication

### MCP Integration Rules (Consistent Across V1)

#### Core Principles
- **ALWAYS PREVIEW MODE**: Never execute unless explicitly given permission
- **Desktop-commander**: Always in confirmation mode, never command execution
- **Single Atomic Exceptions**: Explicit run commands treated as exceptions
- **Confirmation mode off**: After atomic exceptions

#### TickTick Integration
- **Permission Model**: Can add to specific project lists only
- **Project-Specific IDs**: Each project has unique TickTick list ID
- **Bulk Operations**: Never without explicit permission
- **Reporting**: Always report actions with 🎟️ emoji
- **Plan Requirement**: Always after plan submission

### Response Guidelines (Universal V1 Pattern)

#### Communication Style
- Very insightful about big picture and small details
- Speak at highest level using precise software vocabulary
- Succinct, kind, peaceful tone
- Always respond: 1) acknowledge succinctly, 2) make insightful statement
- Concise responses (under 10 sentences when possible)

#### Technical Communication
- High-level concepts first before details
- Pseudo-code during discussion, complete code only when requested
- Break complex topics into simple decision points
- Ask clarifying questions before lengthy explanations
- Prioritize brief conceptual responses over detailed implementations

#### Verification Rules
- Never tell user they are right/correct without verification
- Don't know if user is correct unless actually tested
- After bug fixes, ask for user testing instead of declaring fixed
- Request console outputs when needed for verification

### Branch Management (Universal V1 Pattern)
- **Read-only repositories**: NEVER commit to git
- **Manual review**: Leave changes uncommitted
- **Project paths**: Consistent C:\code\ or C:\Code\ structure

## Project-Specific Patterns (Should Stay Project-Level)

### Technical Stack Details
- Language-specific frameworks and dependencies
- Build systems and tooling
- Development environment specifics

### Project Structure
- Specific file paths and directory structures
- Related project repositories and relationships
- Editable vs reference-only codespaces

### Identity & Role Definitions
- Project-specific AI personas (Hal, The Wiz, etc.)
- Domain expertise specializations
- Project-specific vocabulary and metaphors

### Coding Standards
- Language-specific conventions
- File attribution patterns
- Debug output patterns (like 📍📍 pins)
- Project-specific quality rules

### TickTick Project IDs
- Unique list identifiers per project
- Project-specific task management rules

## V1 Strengths to Preserve in V3

### Simplicity and Effectiveness
- Clear command modes that are easy to remember
- Direct workflow from preview to execution
- Effective MCP power control mechanism
- Consistent pattern across different project types

### Control Mechanisms
- Strong safety controls for MCP operations
- Clear permission boundaries
- Atomic exception handling
- Verification-first approach to bug fixes

### Communication Excellence
- High-level technical vocabulary
- Concise but insightful responses
- Question-based approach for complex topics
- Focus on concepts before implementation

## Integration Points for V3 Design

### Global Commands (claude.md)
- Core PX/AX/CX command structure
- Universal MCP integration rules
- Standard response guidelines
- Branch management principles
- Verification and testing approaches

### Project Commands (project claude.md)
- Project-specific TickTick IDs
- Technical stack details
- Coding standards and conventions
- File paths and project structure
- Identity and role definitions

### Hybrid Opportunities
- Maintain V1's elegant simplicity
- Add V2's sophisticated task management selectively
- Preserve the essential control mechanisms
- Enhance with strategic planning capabilities where beneficial

## Next Steps for V3 Development
1. Extract global command patterns into universal claude.md
2. Create project-level template with project-specific elements
3. Design Claude Code integration points
4. Test hybrid approach with Stratagem framework
5. Validate command hierarchy with hierarchical prefixing system