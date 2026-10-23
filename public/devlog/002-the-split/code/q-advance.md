I was imagining the core as a blackbox engine:
caller submits actions, the engine returns events.

Another way to argue against frontend calling `advance`:
if advance is going to be called eventually, then timing
is pointless to the backend.
