# CLI Tool

Command-line interface for querying train schedules from 12306.

## Usage

```bash
node bin/cli.js [options]
```

### Options

- `--from <station_code>`: Departure station code (default: BJQ for Beijing)
- `--to <station_code>`: Arrival station code (default: SHH for Shanghai)
- `--date <date>`: Travel date (YYYY-MM-DD, default: tomorrow)
- `--help`: Show help message

### Examples

```bash
# Query for specific route and date
node bin/cli.js --from BJQ --to SHH --date 2026-02-06

# Query for custom route
node bin/cli.js --from QIP --to OKP --date 2026-02-06
```

## Implementation Notes

This CLI provides a convenient interface for querying train schedules. However, please note:

1. 12306 requires authentication and captcha handling for actual API requests
2. The service has anti-bot measures that may prevent automated queries
3. The current implementation shows the structure but does not execute actual queries due to these restrictions

To implement actual querying functionality, you would need to handle the authentication flow and captcha verification properly.