the messaging module prototype design and workflow draft.

![diagram](/examples/msg-prototype/msg-prototyping.png?raw=true "diagram")

# Component breakdown

## Session broker

a load balancer should sit in front of N session-brokers, to ensure, at any given moment, there is at least one broker available;
the load balancer should also handle front facing IP, TLS configuration and be able to balance incoming http connections evenly for each broker;

incoming connections should be authenticated prior to their reach of any session broker;

a session-broker is stateless;

all session-brokers are backed by a single one storage;

a session-broker validates incoming connections, with user info, connection info and current policy;
the policy could be defined as such, so that one user-device-clientIp combination is allowed to maintain only one live session;
* if the validation succeeded, then a new session ticket is issued and returned;
* if the client retries and succeeded, and previous ticket has not been used, then it can be returned as such;
* if the client retries and succeeded, but previous ticket is in use, then it should invalidate the ticket and any existing session base upon that should also be dropped in favor of a new one;
* if the validation failed, no ticket should be returned;

a session ticket may contain a token for later stage validation, a Front-Machine address to connect to, and other necessary information.

a session broker depends on a Front-Machine-Selector(FM-Selector for short) and Front-Machine-Token(FM-Token for short).

### FM-Selector
with inputs such as client ip, user id, device id, will return a Front-Machine-IP, base on current system load.

### FM-Token
with inputs such as client ip, user id, device id, and other factors, will return a token for later authentication.

## Session manager
there will be M session-managers for a M Front-Machine deployment, one manager for each front web socket machine.

each front ws machine exposes a public ip for clients to connect to with valid tokens.

a session manager validates session requests by activating a ws session object.

a session manager manages ws sessions by creating/removing/passing messages among/...ws connections.

a session manager connects to a message queue, constantly pulls out messages and sends to appropriate ws connections.

a session manager depends on a Front-Machine-Authenticator(FM-Auth for short).

### FM-Auth
validate token authenticity of the incoming session requests

## Process Unit
upon server side message delivery, the process unit will try to locate a list of proper session manager message queues by querying the queue selector.

the queue selector will look for signs of any live ws connection, and returns a list of session manager message queues; if no live ws connection could be found, a queue for notification is returned instead.

server side messages will be queued up into those message queues.

### Queue Selector
base on session storage, look for active ws connections, and return a list of session manager message queue identifiers.(base on implementation, it could be just part of process unit's storage operation handling message distribution.)
