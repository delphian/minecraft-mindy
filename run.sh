// http://stackoverflow.com/questions/4797050/how-to-run-process-as-background-and-never-die

// Detach from TTY and run as a daemon.
screen -dmS mindy node mindy.js

// To reattach: screen -r mindy
