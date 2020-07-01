import React, { FC, useState } from 'react';
import { useStatus, useMamService, MamMessage } from 'xmpp-react-hooks';
import Loading from '../components/Loading';

export interface MamProps {}

const Mam: FC<MamProps> = (_props: MamProps) => {
  const [mamMessages, setMamMessages] = useState<MamMessage[]>([]);
  const [withJid, setWithJid] = useState<string>();
  const mamService = useMamService();
  const status = useStatus();

  async function handleGetMamMessages(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    const mamMessages = (await mamService?.getMessages(withJid)) || [];
    setMamMessages(mamMessages);
  }

  if (!status.isReady) return <Loading />;
  return (
    <div>
      <h1>Mam</h1>
      <hr />
      <h3></h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="withJid">WithJid:</label>
          <br />
        </div>
        <input
          id="withJid"
          name="withJid"
          onChange={(e: any) => setWithJid(e.target.value)}
          value={withJid}
        />
        {JSON.stringify(mamMessages)}
        <button type="submit" onClick={handleGetMamMessages}>
          Get Messages
        </button>
      </form>
    </div>
  );
};

Mam.defaultProps = {};

export default Mam;
