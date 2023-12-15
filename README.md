# Spacegray Input for VSCode

The [Spacegray](https://github.com/zetavg/spacegray) theme with the [Input](https://input.djr.com/) font for VSCode.

## Customizing the Theme

You can customize the Spacegray Input theme to your preferences by overriding it in your User Settings:

1. Open the `settings.json` file with the **Preferences: Open User Settings (JSON)** command in the Command Palette (`Ctrl+Shift+P` or `⇧⌘P`).

2. Add or adjust the workbench.colorCustomizations section in your settings. Here's an example to get you started:

```json
{
    "workbench.colorCustomizations": {
        "[Spacegray Input Dark]": {
            "editorInfo.foreground": "#00000000",
            "editorInfo.background": "#3794ff55",
            "editorWarning.foreground": "#00000000",
            "editorWarning.background": "#F14C4C33",
            "editorError.foreground": "#00000000",
            "editorError.background": "#F14C4C33",
            // Add more customizations as needed
        }
    }
}
```

See the [Theme Color Reference](https://code.visualstudio.com/api/references/theme-color) for more details.

## Credits

This theme is based on the [Spacegray](https://github.com/SublimeText/Spacegray) theme for sublime text and the [Spacegray VSCode](https://github.com/mihai-vlc/spacegray-vscode/tree/master?tab=readme-ov-file) theme by Mihai Ionut Vilcu (mihai-vlc).
