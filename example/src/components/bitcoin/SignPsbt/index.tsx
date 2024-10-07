import { Button, Card, Input, NativeSelect } from '@mantine/core';
import { Verifier } from 'bip322-js';
import * as btc from 'bitcoinjs-lib';
import { verify } from 'bitcoinjs-message';
import { useState } from 'react';
import Wallet, { Address, MessageSigningProtocols, RpcErrorCode } from 'sats-connect';

interface Props {
  addresses: Address[];
}

export const SignPsbt = ({ addresses }: Props) => {
  const [psbt, setPsbt] = useState('');
  const [address, setAddress] = useState(addresses[0]?.address);
  const [input, setInput] = useState(0);
  const [sighash, setSighash] = useState(btc.Transaction.SIGHASH_DEFAULT);

  const onClick = async () => {
    let signInputs = {};
    signInputs[address] = [input];
    const response = await Wallet.request('signPsbt', {
      psbt,
      signInputs,
      allowedSignHash: sighash ? (sighash as number) : btc.Transaction.SIGHASH_DEFAULT,
    });
    if (response.status === 'success') {
      alert(`PSBT signed successfully check console for details. `);
      console.log(response.result);

      /*
      if (sighash === MessageSigningProtocols.ECDSA) {
        const verified = verify(psbt, address, response.result.signature, undefined, true);
        if (!verified) {
          alert('Signature verification failed');
          return;
        }
        console.log(`verified: ${verified}`);
      }
      if (sighash === MessageSigningProtocols.BIP322) {
        const verified = Verifier.verifySignature(address, psbt, response.result.signature);
        if (!verified) {
          alert('Signature verification failed');
          return;
        }
        console.log(`verified: ${verified}`);
      }
      */
    } else if (response.error.code === RpcErrorCode.USER_REJECTION) {
      alert('User cancelled the request');
    } else {
      console.error(response.error);
      alert('Error sending BTC. See console for details.');
    }
  };

  return (
    <Card>
      <h3>Sign PSBT</h3>
      <>
        <div>
          <div>PSBT</div>
          <Input type="text" value={psbt} onChange={(e) => setPsbt(e.target.value)} />
        </div>
        <div style={{ marginTop: 15 }}>
          <div>Address</div>
          <NativeSelect defaultValue={address} onChange={(e) => setAddress(e.target.value)}>
            <option value={addresses[0]?.address}>{addresses[0]?.address}</option>
            <option value={addresses[1]?.address}>{addresses[1]?.address}</option>
          </NativeSelect>
        </div>
        <div style={{ marginTop: 15 }}>
          <div>Input</div>
          <Input type="number" value={input} onChange={(e) => setInput(parseInt(e.target.value))} />
        </div>
        <div style={{ marginTop: 15 }}>
          <div>Allowed SignHash</div>
          <NativeSelect
            defaultValue={sighash}
            onChange={(e) => setSighash(parseInt(e.target.value))}
          >
            <option value={btc.Transaction.SIGHASH_DEFAULT}>SIGHASH_DEFAULT</option>
            <option value={btc.Transaction.SIGHASH_ALL}>SIGHASH_ALL</option>
            <option value={btc.Transaction.SIGHASH_NONE}>SIGHASH_NONE</option>
            <option value={btc.Transaction.SIGHASH_SINGLE}>SIGHASH_SINGLE</option>
            <option value={btc.Transaction.SIGHASH_ANYONECANPAY}>SIGHASH_ANYONECANPAY</option>
            <option value={btc.Transaction.SIGHASH_OUTPUT_MASK}>SIGHASH_OUTPUT_MASK</option>
            <option value={btc.Transaction.SIGHASH_INPUT_MASK}>SIGHASH_INPUT_MASK</option>
          </NativeSelect>
        </div>
        <Button onClick={onClick} disabled={!psbt} style={{ marginTop: 15 }}>
          Sign PSBT
        </Button>
      </>
    </Card>
  );
};
