# Enhanced Rule Builder Technical Specifications

## Overview
This document provides detailed technical specifications for implementing **UX Recommendation 2: Enhanced Rule Builder UX** to transform the complex 982-line rule builder into an intuitive visual interface.

## Current State Analysis

### Existing Rule Builder Issues
- **File**: `apps/web/components/aura/rule-builder.tsx` (982 lines)
- **Complexity**: Overwhelming form-based interface
- **Poor UX**: Text-heavy, difficult to understand rule relationships
- **Limited Discoverability**: Advanced features hidden in dropdowns
- **No Visual Feedback**: Abstract rule concepts without visual representation

## Proposed Visual Rule Builder Architecture

### 1. Component Structure

```
apps/web/components/aura/visual-rule-builder/
├── index.tsx                    # Main visual rule builder
├── rule-canvas.tsx             # Drag-and-drop canvas
├── sensor-palette.tsx          # Available sensors sidebar
├── action-palette.tsx          # Available actions sidebar
├── rule-node.tsx              # Individual rule node component
├── connection-line.tsx         # Visual connections between nodes
├── rule-template-gallery.tsx  # Pre-built rule templates
├── rule-tester.tsx            # Real-time rule testing
└── rule-preview.tsx           # Live rule behavior preview
```

### 2. Core Components Specification

#### Main Visual Rule Builder Component

```typescript
// apps/web/components/aura/visual-rule-builder/index.tsx
interface VisualRuleBuilderProps {
  auraId: string
  availableSenses: string[]
  existingRules: BehaviorRule[]
  onRuleCreate: (rule: BehaviorRule) => void
  onRuleUpdate: (ruleId: string, updates: Partial<BehaviorRule>) => void
  onRuleDelete: (ruleId: string) => void
}

export function VisualRuleBuilder({
  auraId,
  availableSenses,
  existingRules,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete
}: VisualRuleBuilderProps) {
  const [selectedMode, setSelectedMode] = useState<'visual' | 'template' | 'advanced'>('visual')
  const [canvasNodes, setCanvasNodes] = useState<RuleNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedRule, setSelectedRule] = useState<BehaviorRule | null>(null)

  return (
    <div className="h-screen flex flex-col">
      <RuleBuilderHeader 
        mode={selectedMode} 
        onModeChange={setSelectedMode}
        onSave={handleSaveAll}
        onTest={handleTestRules}
      />
      
      <div className="flex-1 flex">
        {selectedMode === 'visual' && (
          <>
            <SensorPalette 
              sensors={availableSenses}
              onDragStart={handleSensorDragStart}
            />
            <RuleCanvas 
              nodes={canvasNodes}
              connections={connections}
              onNodeAdd={handleNodeAdd}
              onNodeUpdate={handleNodeUpdate}
              onConnectionCreate={handleConnectionCreate}
            />
            <ActionPalette 
              actions={AVAILABLE_ACTIONS}
              onDragStart={handleActionDragStart}
            />
          </>
        )}
        
        {selectedMode === 'template' && (
          <RuleTemplateGallery 
            templates={RULE_TEMPLATES}
            onTemplateSelect={handleTemplateSelect}
            availableSenses={availableSenses}
          />
        )}
        
        {selectedMode === 'advanced' && (
          <AdvancedRuleEditor 
            rules={existingRules}
            onRuleEdit={onRuleUpdate}
          />
        )}
      </div>
      
      {selectedRule && (
        <RulePreviewPanel 
          rule={selectedRule}
          onClose={() => setSelectedRule(null)}
          onTest={handleTestRule}
        />
      )}
    </div>
  )
}
```

#### Rule Canvas Component

```typescript
// apps/web/components/aura/visual-rule-builder/rule-canvas.tsx
interface RuleCanvasProps {
  nodes: RuleNode[]
  connections: Connection[]
  onNodeAdd: (node: RuleNode) => void
  onNodeUpdate: (nodeId: string, updates: Partial<RuleNode>) => void
  onConnectionCreate: (connection: Connection) => void
}

export function RuleCanvas({
  nodes,
  connections,
  onNodeAdd,
  onNodeUpdate,
  onConnectionCreate
}: RuleCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<NodeConnection | null>(null)

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault()
    if (!draggedItem || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    const newNode: RuleNode = {
      id: generateId(),
      type: draggedItem.type,
      data: draggedItem.data,
      position,
      connections: { inputs: [], outputs: [] }
    }

    onNodeAdd(newNode)
    setDraggedItem(null)
  }, [draggedItem, onNodeAdd])

  return (
    <div 
      ref={canvasRef}
      className="flex-1 relative bg-gray-50 overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Grid Background */}
      <CanvasGrid />
      
      {/* Render Nodes */}
      {nodes.map(node => (
        <RuleNode
          key={node.id}
          node={node}
          onUpdate={(updates) => onNodeUpdate(node.id, updates)}
          onConnectionStart={handleConnectionStart}
          onConnectionEnd={handleConnectionEnd}
          isConnecting={isConnecting}
        />
      ))}
      
      {/* Render Connections */}
      <svg className="absolute inset-0 pointer-events-none">
        {connections.map(connection => (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            nodes={nodes}
          />
        ))}
      </svg>
      
      {/* Connection Preview */}
      {isConnecting && connectionStart && (
        <ConnectionPreview 
          start={connectionStart}
          mousePosition={mousePosition}
        />
      )}
      
      {/* Empty State */}
      {nodes.length === 0 && (
        <EmptyCanvasState onGetStarted={handleGetStarted} />
      )}
    </div>
  )
}
```

#### Rule Node Component

```typescript
// apps/web/components/aura/visual-rule-builder/rule-node.tsx
interface RuleNodeProps {
  node: RuleNode
  onUpdate: (updates: Partial<RuleNode>) => void
  onConnectionStart: (nodeId: string, port: string) => void
  onConnectionEnd: (nodeId: string, port: string) => void
  isConnecting: boolean
}

export function RuleNode({
  node,
  onUpdate,
  onConnectionStart,
  onConnectionEnd,
  isConnecting
}: RuleNodeProps) {
  const [isSelected, setIsSelected] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  const nodeConfig = NODE_CONFIGS[node.type]
  
  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute bg-white rounded-lg shadow-lg border-2 min-w-48",
        isSelected ? "border-purple-400 shadow-xl" : "border-gray-200",
        "hover:shadow-xl transition-all duration-200"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)'
      }}
      onClick={() => setIsSelected(!isSelected)}
    >
      {/* Node Header */}
      <div className={cn(
        "px-4 py-2 rounded-t-lg flex items-center gap-2",
        nodeConfig.headerColor
      )}>
        <nodeConfig.icon className="w-4 h-4 text-white" />
        <span className="font-medium text-white text-sm">
          {nodeConfig.title}
        </span>
        <div className="ml-auto flex gap-1">
          <NodeAction icon={Edit} onClick={() => setIsEditing(true)} />
          <NodeAction icon={Trash2} onClick={() => onUpdate({ deleted: true })} />
        </div>
      </div>
      
      {/* Node Content */}
      <div className="p-4">
        {isEditing ? (
          <NodeEditor 
            node={node}
            onSave={(updates) => {
              onUpdate(updates)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <NodeDisplay node={node} />
        )}
      </div>
      
      {/* Connection Ports */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
        <ConnectionPort
          type="input"
          nodeId={node.id}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          isConnecting={isConnecting}
        />
      </div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
        <ConnectionPort
          type="output"
          nodeId={node.id}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          isConnecting={isConnecting}
        />
      </div>
    </div>
  )
}
```

### 3. Rule Template System

#### Template Gallery Component

```typescript
// apps/web/components/aura/visual-rule-builder/rule-template-gallery.tsx
interface RuleTemplateGalleryProps {
  templates: RuleTemplate[]
  onTemplateSelect: (template: RuleTemplate) => void
  availableSenses: string[]
}

export function RuleTemplateGallery({
  templates,
  onTemplateSelect,
  availableSenses
}: RuleTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase())
      const hasRequiredSenses = template.requiredSenses.every(sense => 
        availableSenses.includes(sense)
      )
      
      return matchesCategory && matchesSearch && hasRequiredSenses
    })
  }, [templates, selectedCategory, searchQuery, availableSenses])

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Rule Templates</h2>
        <p className="text-gray-600">
          Choose from pre-built rule templates or create your own from scratch
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <TemplateSearch 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search templates..."
        />
        <CategoryFilter
          categories={TEMPLATE_CATEGORIES}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => onTemplateSelect(template)}
            isAvailable={template.requiredSenses.every(sense => 
              availableSenses.includes(sense)
            )}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <EmptyTemplateState 
          hasSearch={searchQuery.length > 0}
          onClearSearch={() => setSearchQuery('')}
        />
      )}
    </div>
  )
}
```

#### Template Card Component

```typescript
// Template card with visual preview
export function TemplateCard({
  template,
  onSelect,
  isAvailable
}: {
  template: RuleTemplate
  onSelect: () => void
  isAvailable: boolean
}) {
  return (
    <Card className={cn(
      "cursor-pointer transition-all duration-200 hover:shadow-lg",
      isAvailable ? "hover:border-purple-300" : "opacity-60 cursor-not-allowed"
    )}>
      {/* Template Preview */}
      <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg p-4">
        <TemplateVisualPreview template={template} />
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <Badge variant={template.difficulty === 'easy' ? 'default' : 'secondary'}>
            {template.difficulty}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          {template.description}
        </p>
        
        {/* Required Senses */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Required senses:</div>
          <div className="flex flex-wrap gap-1">
            {template.requiredSenses.map(sense => (
              <Badge key={sense} variant="outline" className="text-xs">
                {sense}
              </Badge>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={onSelect}
          disabled={!isAvailable}
          className="w-full"
          size="sm"
        >
          {isAvailable ? 'Use Template' : 'Missing Senses'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 4. Rule Testing System

#### Rule Tester Component

```typescript
// apps/web/components/aura/visual-rule-builder/rule-tester.tsx
interface RuleTesterProps {
  rule: BehaviorRule
  availableSenses: string[]
  onTestComplete: (result: TestResult) => void
}

export function RuleTester({
  rule,
  availableSenses,
  onTestComplete
}: RuleTesterProps) {
  const [testScenario, setTestScenario] = useState<TestScenario | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const runTest = async (scenario: TestScenario) => {
    setIsRunning(true)
    try {
      const result = await simulateRule(rule, scenario)
      setTestResults(prev => [...prev, result])
      onTestComplete(result)
    } catch (error) {
      console.error('Rule test failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Test Rule: {rule.name}</h3>
        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
          {rule.enabled ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Test Scenario Builder */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Create Test Scenario</h4>
        <TestScenarioBuilder
          rule={rule}
          availableSenses={availableSenses}
          onScenarioCreate={setTestScenario}
        />
      </div>

      {/* Test Controls */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={() => testScenario && runTest(testScenario)}
          disabled={!testScenario || isRunning}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Test...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setTestResults([])}
          disabled={testResults.length === 0}
        >
          Clear Results
        </Button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Test Results</h4>
          {testResults.map((result, index) => (
            <TestResultCard key={index} result={result} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 5. Data Models

#### Rule Node Types

```typescript
// apps/web/types/visual-rule-builder.ts
export interface RuleNode {
  id: string
  type: 'sensor' | 'condition' | 'action' | 'logic'
  data: NodeData
  position: { x: number; y: number }
  connections: {
    inputs: string[]
    outputs: string[]
  }
}

export interface NodeData {
  // Sensor nodes
  sensorType?: string
  sensorConfig?: Record<string, any>
  
  // Condition nodes
  operator?: string
  value?: any
  
  // Action nodes
  actionType?: string
  actionConfig?: Record<string, any>
  
  // Logic nodes
  logicType?: 'AND' | 'OR' | 'NOT'
}

export interface Connection {
  id: string
  from: { nodeId: string; port: string }
  to: { nodeId: string; port: string }
  type: 'data' | 'trigger'
}

export interface RuleTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  requiredSenses: string[]
  nodes: RuleNode[]
  connections: Connection[]
  preview: string
  tags: string[]
}
```

### 6. Implementation Timeline

#### Week 1: Core Visual Builder
- [ ] Create basic canvas and node system
- [ ] Implement drag-and-drop functionality
- [ ] Add connection system between nodes
- [ ] Basic node types (sensor, action, condition)

#### Week 2: Template System
- [ ] Build template gallery interface
- [ ] Create comprehensive template library
- [ ] Implement template application logic
- [ ] Add template customization options

#### Week 3: Testing & Preview
- [ ] Build rule simulation system
- [ ] Add real-time rule testing
- [ ] Implement response preview
- [ ] Add performance monitoring

#### Week 4: Integration & Polish
- [ ] Integrate with existing rule system
- [ ] Add migration from old rule builder
- [ ] Performance optimization
- [ ] User testing and feedback integration

### 7. Success Metrics

#### User Experience Metrics
- **Rule Creation Time**: Reduce from 10+ minutes to <5 minutes
- **Rule Complexity**: Enable users to create more sophisticated rules
- **Error Rate**: Reduce rule configuration errors by 60%
- **Feature Discovery**: Increase advanced rule feature usage by 50%

#### Technical Metrics
- **Performance**: Canvas should handle 50+ nodes smoothly
- **Responsiveness**: All interactions should respond within 100ms
- **Accessibility**: Full keyboard navigation support
- **Mobile Support**: Basic functionality on tablet devices

This enhanced rule builder will transform the complex text-based interface into an intuitive visual system that makes rule creation accessible to all users while maintaining the power needed for advanced configurations.