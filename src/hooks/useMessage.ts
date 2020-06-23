// import { useEffect } from 'react';
// import useRosterService from './useRosterService';
// import useStateCache from './useStateCache';
// import { RosterItem } from '../services';
// import Message from '../services/message';
// import useXmpp from './useXmpp';

// export default function useMessage(): any {
//   //   const [roster, setRoster] = useStateCache<RosterItem[]>('roster', []);
//   //   const rosterService = useRosterService();
//   const xmpp = useXmpp();
//   useEffect(() => {
//     // let cleanup;
//     (async () => {
//       if (!xmpp) return;
//       const messageTesting = new Message(xmpp);
//       //   setRoster(result);
//       messageTesting.readMessages((message: any) =>
//         console.log('message', message)
//       );
//     })().catch(console.error);
//     // return () => cleanup();
//   }, []);

//   return '';
// }
