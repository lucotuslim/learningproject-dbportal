const apiUrl = process.env.controldbserverapi ?? "not set"

export default function ApiDiv() {
    return <div>{String(apiUrl)}</div>;

}