the messaging module prototype design and workflow draft.

![diagram](/examples/msg-prototype/msg-prototyping.png?raw=true "diagram")

# Component breakdown

## Session broker

a load balancer should sit in front of N session-brokers, to ensure, at any given moment, there is at least one broker available;
the load balancer should also handle front facing IP, TLS configuration and be able to balance incoming http connections evenly to each broker;

incoming connections should be authenticated prior to their reach of any session broker;

a session-broker should be stateless;

a session-broker is backed by msg-storage;

a session-broker validates incoming connections, with user info, connection info and current policy;
the policy could be defined as such, so that one user-device-client combination is allowed to maintain only one non-closed session;
* if the validation succeeded, then a new session ticket gets issued;
* if the client retries, and previous ticket has not been used, then the session is reused to generate a new ticket;
* if the client retries, but previous ticket has been used, then an error is returned. client should either continue using its current connection or close it before it can get a new one;
* if validation failed, no ticket will be returned;
* TBD what if Session Manager errors out leaving session state inconsistent?

a session ticket contains a token for later stage validation when establishing ws connection, a Front-Machine address to connect to, and maybe other necessary information.

a session broker depends on a Front-Machine-Selector(FM-Selector), Front-Machine-Token(FM-Token) and Front-Machine-Policy(FM-Policy).

### FM-Selector
based on client information, will create a session record and return a session ticket, base on current system load profile.

### FM-Token
based on client information and policy result, will return a token encapsulating all that for later authentication, this token is compute base and should not be stored on server.

### FM-Policy
based on client information, system load profile, and policy settings, will return a jsonwebtoken.


## Session manager
there will be N session-managers for a N Front-Machine deployment, one manager for each front web socket machine.

each front ws machine exposes a public ip for clients to connect to with valid tokens.

a session manager validates session requests by validating token payloads.

a session manager manages ws connections and their corresponding session records.

a session manager connects to a message queue, constantly pulling server side messages and sends to appropriate ws connections.

a session manager depends on a Front-Machine-Authenticator(FM-Auth for short).

### FM-Auth
validate token authenticity of the incoming session requests

## Process Unit
upon server side message delivery, the process unit will try to locate a list of proper session manager message queues by querying the queue selector.

the queue selector will look for signs of any live ws connection, and returns a list of session manager message queues; if no live ws connection could be found, a queue for notification is returned instead.

server side messages will be queued up into those message queues.

### Queue Selector
base on session storage, look for active ws connections, and return a list of session manager message queue identifiers.(base on implementation, it could be just part of process unit's storage operation handling message distribution.)
