# Spacegray Input for VSCode

The [Spacegray](https://github.com/zetavg/spacegray) theme with the [Input](https://input.djr.com/) font for VSCode.

> Note: This theme requires additional installation steps to get the full experience. See the [Installation](https://github.com/zetavg/spacegray-input-vscode?tab=readme-ov-file#installation) documentation for more details.

## Installation

### Install the Input Font

The font used in this theme is the [Input](https://input.djr.com) font. To install it, download the font files from its [website](https://input.djr.com) and install them on your system.

### Applying CSS Styles

The font and spacing adjustments of this theme rely on loading custom CSS styles into VSCode. This can be achieved by the [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) extension. To install it, open the Command Palette (`Ctrl+Shift+P` or `⇧⌘P`) and run the **Extensions: Install Extensions** command. Then, search for "Custom CSS and JS Loader" and install it.

Once the extension is installed, you need to configure it to load the custom CSS styles. To do this, open the Command Palette (`Ctrl+Shift+P` or `⇧⌘P`) and run the **Preferences: Open Settings (JSON)** command. Then, add the following settings to your `settings.json` file:


```json
{
    "vscode_custom_css.imports": [
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/all.css"
    ]
}
```

<details>
<summary>Or, you can also load the CSS files individually...</summary>
<pre>
{
    "vscode_custom_css.imports": [
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/font.css",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/color.css",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/icon-opacit",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/spacing.css",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/editor-style",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/tabs.css",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/hide-stuff.css",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/no-pointers.css"
    ]
}
</pre>
</details>

Finally, run the **Custom CSS and JS: Reload Custom CSS and JS** command from the Command Palette (`Ctrl+Shift+P` or `⇧⌘P`) to load the custom CSS styles and reload VSCode.

> [!NOTE]
> * If Visual Studio Code notifies you that its installation is corrupted, simply click "Don't show again."
> * Every time after Visual Studio Code is updated, please re-run the **Custom CSS and JS: Reload Custom CSS and JS** command.


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


## Development

Run `npm run compile-css` to compile CSS files after changing any `.postcss` files.


## Credits

This theme is based on the [Spacegray](https://github.com/SublimeText/Spacegray) theme for sublime text and the [Spacegray VSCode](https://github.com/mihai-vlc/spacegray-vscode/tree/master?tab=readme-ov-file) theme by Mihai Ionut Vilcu (mihai-vlc).
