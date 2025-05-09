# Agent Routing System

The Pulser Web Interface uses a sophisticated agent routing system to direct user messages to specialized handlers.

## Routing Flow

```
┌──────────────┐
│  User Input  │
└───────┬──────┘
        │
        ▼
┌───────────────┐     ┌───────────────┐
│ Message       │     │ Agent Config  │
│ Analysis      │◄────┤ - Triggers    │
└───────┬───────┘     │ - Fallbacks   │
        │             └───────────────┘
        ▼
┌───────────────┐
│ Agent         │
│ Selection     │
└───────┬───────┘
        │
        ▼
┌───────────────────────────────────────┐
│                                       │
│             Agent Router              │
│                                       │
└───────┬───────────┬───────────┬───────┘
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────┐
│ Claudia     │ │ Shogun  │ │ Echo    │ ...
│ Orchestrator│ │ UI Auto │ │ Voice   │
└─────────────┘ └─────────┘ └─────────┘
```

## Agent Capabilities

| Agent   | Role               | Trigger Keywords                             | Specialty                     |
|---------|--------------------|--------------------------------------------- |-------------------------------|
| Claudia | Primary            | organize, plan, manage, coordinate           | Orchestration and planning    |
| Echo    | Voice perception   | listen, voice, transcribe, audio             | Voice processing              |
| Shogun  | UI automation      | automate, browser, click, dns, domain        | Browser tasks and DNS config  |
| Kalaw   | Knowledge          | research, find, search, lookup               | Information retrieval         |
| Maya    | Workflow           | workflow, process, steps, diagram            | Process definition/design     |
| Caca    | Quality assurance  | verify, check, test, validate                | Testing and validation        |
| Basher  | System operations  | terminal, command, bash, script, run         | Command execution             |

## Routing Algorithm

1. Check for explicit agent (`--agent` parameter)
2. If none specified, analyze message for trigger words
3. Check for special command patterns
4. Route to matching agent or fall back to default (Claudia)

## Message Context

The router maintains context between messages to ensure coherent conversations:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ User        │     │ Current     │     │ Context     │
│ Message     │────►│ Processing  │◄────┤ History     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Response    │
                    │ Generation  │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Save to     │
                    │ Context     │
                    └─────────────┘
```

## LLM Integration

Each agent can use different LLM providers:

1. **Claude**: Default provider using Claude CLI
2. **Local LLM**: Connection to local model servers
3. **Pulser Legacy**: Fall back to classic pulser command

Configuration is controlled through environment variables in `.env`.