// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import axios, { AxiosResponse } from "axios";
import { type } from "os";

type FamousSaying = {
  auther: string;
  meigen: string;
};

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "vscode-study" is now active!');

  let famousSaying = vscode.commands.registerCommand(
    "famousSaying",
    async () => {
      let activeText = vscode.window.activeTextEditor;
      //初期文字数
      let firstWordCount = activeText?.document.getText().length;
      //初期閾値
      let threshold = 20;
      //閾値一覧
      let thresholdList = ["10", "20", "30", "40", "50", "100", "200"];

      //非同期処理なのでawaitで入力を待たせる必要がある
      threshold = Number(await vscode.window.showQuickPick(thresholdList));
      vscode.window.showInformationMessage("Start");

      // 編集しているファイルの変更を検知
      vscode.window.onDidChangeVisibleTextEditors(() => {
        activeText = vscode.window.activeTextEditor;
        firstWordCount = activeText?.document.getText().length;
      });

      //ファイルの書き換えを検知
      vscode.workspace.onDidChangeTextDocument(() => {
        //現在の文字数を取得
        let currentWordCount = activeText?.document.getText().length;
        //初期の文字数との差
        let diff = (currentWordCount as number) - (firstWordCount as number);

        //関数式を使う場合巻き上げはないので処理前に定義する必要がある
        const sendTerminalFamousSaying = async () => {
          try {
            const resposeData: AxiosResponse<FamousSaying[]> = await axios.get(
              "https://meigen.doodlenote.net/api/json.php"
            );
            console.log(resposeData);

            vscode.window.activeTerminal?.sendText(
              "echo" + " " + resposeData["data"][0]["meigen"] + " > nul"
            );
          } catch {
            console.log("error");
          }
        };

        //一定の閾値を超えたら処理を実行
        if (diff > threshold) {
          sendTerminalFamousSaying();
          firstWordCount = (firstWordCount as number) + threshold;
        }

        //ファイルの文字数が初期文字数より少なくなった時に対応
        if (diff < 0) {
          firstWordCount = (firstWordCount as number) + diff;
        }
      });
    }
  );
  context.subscriptions.push(famousSaying);
}

// this method is called when your extension is deactivated
export function deactivate() {}
