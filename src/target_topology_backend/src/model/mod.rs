use candid::CandidType;

pub mod node;

type CustomResult<T> = std::result::Result<T, String>;

#[derive(CandidType)]
pub struct TargetTopologyResult<T>(pub CustomResult<T>);

impl<T> From<anyhow::Result<T>> for TargetTopologyResult<T>
where
    T: CandidType,
{
    fn from(value: anyhow::Result<T>) -> Self {
        TargetTopologyResult(value.map_err(|e| e.to_string()))
    }
}
