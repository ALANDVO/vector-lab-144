# testcli CLI

Generated CLI from source code analysis.

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Set the target module path
export CLI_TARGET_PATH=/path/to/your/app

# Run commands
testcli <command> [options]
```

## Commands

### create-window

Creates a new browser window

Options:
  --options (string) [required]: Window configuration options
Arguments:
  <options>: Window configuration options


### load-url

Loads a URL in the main window

Options:
  --url (string) [required]: The URL to load
  --window (string): Optional window instance
Arguments:
  <url>: The URL to load


### show-window

Shows the main window



### hide-window

Hides the main window



### quit-app

Quits the application



## Development

```bash
npm run dev -- <command> [options]
```
