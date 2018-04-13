%{
  var ast = require('../ast');
%}

%lex
%%

\s+                      /* skip whitespace */
"-"                      return "-"
"~"                      return "~"
"+"                      return "+"
"^"                      return "^"
"!"                      return "!"
"|"                      return "|"
"#"                      return "#"
"ms"                     return "ms"
"s"                      return "s"
"m"                      return "m"
[0-9]+(\.[0-9]+)?        return "NUMBER"
[a-zA-Z]([0-9a-zA-Z]+)?  return "IDENTIFIER"
<<EOF>>                  return "EOF"
.                        return "INVALID"

/lex

%ebnf
%start Diagram

%%

Diagram
  : Event+ EOF
    {
      $$ = new ast.MarbleDiagram($1);
      return $$;
    }
  ;

Event
  : Next
  | Error
  | Complete
  | MacroTask
  | MicroTask
  | Queue
  | Subscribe
  | Unsubscribe
  | TimeProgression
  ;

TimeProgression
  : "NUMBER"+ TimeUnit
    -> new ast.TimeProgression(parseFloat($1), $2)
  ;

TimeUnit
  : "ms"
    -> ast.DurationUnit.MILLISECONDS
  | "s"
    -> ast.DurationUnit.SECONDS
  | "m"
    -> ast.DurationUnit.MINUTES
  ;

Next
  : ("IDENTIFIER" | "ms"| "s" | "m")
    -> new ast.NextPlaceholder($1)
  ;

Error
  : "#"
    -> new ast.ErrorPlaceholder()
  ;

Complete
  : "|"
    -> new ast.Complete()
  ;

MacroTask
  : "-"
    -> new ast.MacroTask()
  ;

MicroTask
  : "~"
    -> new ast.MicroTask()
  ;

Queue
  : "+"
    -> new ast.Queue()
  ;

Subscribe
  : "^"
    -> new ast.Subscribe()
  ;

Unsubscribe
  : "!"
    -> new ast.Unsubscribe()
  ;
