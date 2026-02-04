use wasm_bindgen::prelude::*;
use tf_demo_parser::{Demo, DemoParser};
use tf_demo_parser::demo::header::Header;
use tf_demo_parser::demo::parser::analyser::MatchState;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct JsonDemo {
    header: Header,
    #[serde(flatten)]
    state: MatchState,
}

#[wasm_bindgen]
pub fn parse(demo_bytes: &[u8]) -> Result<String, JsError> {
    let demo = Demo::new(&demo_bytes);
    let parser = DemoParser::new_all(demo.get_stream());
    let (header, state) = parser.parse()?;
    let demo = JsonDemo { header, state };
    Ok(serde_json::to_string(&demo)?)
}