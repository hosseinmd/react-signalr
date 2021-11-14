import hermes from "hermes-channel";
function removeDuplicates(arr: string[]) {
  const s = new Set(arr);
  const it = s.values();
  return Array.from(it);
}

function sendWithHermes(
  event: string,
  message: any,
  shareConnectionBetweenTab: boolean,
) {
  hermes.send(event, message, shareConnectionBetweenTab ? "all" : "current");
}

export { removeDuplicates, sendWithHermes };
