use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}

pub type Datum {
  owner: VerificationKeyHash,
  vote: ByteArray,
}

validator vote(admin: VerificationKeyHash) {
  spend(
    datum: Option<Datum>,
    _redeemer: Data,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(Datum { owner, .. }) = datum

    let Transaction { extra_signatories, .. } = self

    list.has(extra_signatories, owner) || list.has(extra_signatories, admin)
  }

  else(_) {
    fail
  }
}