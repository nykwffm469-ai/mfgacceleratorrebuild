# Migration Map: 2020 to 2026

## Entity alignment

- `msmfg_AccessRequest` -> `Assessment` and workflow events
- `msmfg_VendorCertification` -> `Certification`
- `msmfg_VendorCapability` -> `Capability`
- `Account` (supplier usage) -> `Supplier`

## Platform strategy

- Source of truth is JSON schema in source control.
- Generate Dataverse or alternate persistence models in CI.
- Keep AI-specific fields outside legacy table naming conventions.
