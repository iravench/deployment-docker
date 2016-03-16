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
* if the validation succeeded, then a new session-instruction is issued and returned;
* if the client retries and succeeded, and previous instruction has not been used, then it can be returned as such;
* if the client retries and succeeded, but previous instruction is in use, then it should be invalidated and any existing session base upon that should be dropped in favor of a new one;
* if the validation failed, no instruction should be returned;

a session-instruction may contain a token for later stage validation use, a WS-Front-Machine IP to connect to, and other necessary information.

a session-broker depends on a WS-Front-Machine-Selector or FM-Selector for short.

## FM-Selector
with inputs such as client ip, user id, device id, the selector will return a session-instruction contains token, Front-Machine-IP, etc., base on current system load.

## Session manager
there will be M session-managers for a M WS-Front-Machine deployment, one manager for each front web socket machine.

each front ws machine exposes a public ip for clients to connect to with valid tokens.

a session manager validates session requests by activating a ws session object.

a session manager manages ws sessions by creating/removing/passing messages among/...ws connections.

a session manager connects to a message queue, constantly pulls out messages and sends to appropriate ws connections.

## Process Unit
upon server side message delivery, the process unit will try to locate a list of proper session manager message queues by querying the queue selector.

the queue selector will look for signs of any live ws connection, and returns a list of session manager message queues; if no live ws connection could be found, a queue for notification is returned instead.

server side messages will be queued up into those message queues.

## Queue Selector
base on session storage, look for active ws connections, and return a list of session manager message queue identifiers.(base on implementation, it could be just part of process unit's storage operation handling message distribution.)
