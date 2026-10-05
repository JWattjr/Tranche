"""Prepare an unsigned write with genlayer-py 0.18.0. Signing stays in the CLI.
This process receives a PUBLIC address and method arguments, never a key.
Internal helpers are explicitly pinned and covered by live transaction proof.
"""
import json
import sys
from types import SimpleNamespace
from genlayer_py import create_client
from genlayer_py.chains import studionet
from genlayer_py.contracts.actions import _encode_add_transaction_data, _prepare_transaction, serialize, calldata
from genlayer_py.contracts.utils import make_calldata_object

request = json.load(sys.stdin)
client = create_client(chain=studionet)
account = SimpleNamespace(address=client.w3.to_checksum_address(request['sender']))
data = serialize([calldata.encode(make_calldata_object(method=request['method'], args=request['args'], kwargs=None)), False])
encoded = _encode_add_transaction_data(self=client, sender_account=account, recipient=client.w3.to_checksum_address(request['address']), consensus_max_rotations=studionet.default_consensus_max_rotations, data=data)
tx = _prepare_transaction(self=client, sender=account.address, recipient=studionet.consensus_main_contract['address'], data=encoded, value=int(request.get('value','0')))
print(json.dumps(tx))
