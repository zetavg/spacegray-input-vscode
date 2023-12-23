# Spacegray Input for VSCode

[![Visual Studio Marketplace](https://badgen.net/vs-marketplace/v/zetavg.spacegray-input-vscode)][1] <a href="https://percy.io/188a0120/spacegray-input-vscode" target="_blank"><img src="https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/images/percy-badge.png" height="20" alt="This project is using Percy.io for visual regression testing."></a>

[1]: https://marketplace.visualstudio.com/items?itemName=zetavg.spacegray-input-vscode

The [Spacegray](https://github.com/zetavg/spacegray) theme with the [Input](https://input.djr.com/) font for VSCode.

> Note: This theme requires additional installation steps to get the full experience. See the [Installation](https://github.com/zetavg/spacegray-input-vscode?tab=readme-ov-file#installation) documentation for more details.

![](https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/screenshots/Screenshot.png)

*For more screenshots on the latest VSCode, check the latest build on [Percy](https://percy.io/188a0120/spacegray-input-vscode).*


## Installation

Search for "Spacegray Input" in the Visual Studio Code Marketplace and install the theme.

Or install it from the command line:

```bash
code --install-extension zetavg.spacegray-input-vscode
```

### Set Icon Themes

After the installation, click the "Set File Icon Theme" and "Set Product Icon Theme" buttons on the extension page to set icon themes to "Spacegray" and "Carbon Icons (Spacegray)" respectively.

![](https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/screenshots/Set-Icon-Themes.png)

### Install the Input Font

The font used in this theme is the [Input](https://input.djr.com) font. To install it, download the font files from its [website](https://input.djr.com) and install them on your system.

You may also want to configure VSCode to use the Input font. To do this, open the Command Palette (`Ctrl+Shift+P` or `⇧⌘P`) and run the **Preferences: Open User Settings (JSON)** command. Then, add the following settings to your `settings.json` file:

```json
{
    "editor.fontFamily": "Input Mono",
    "editor.fontWeight": "300",
    "editor.fontSize": 16.5,
    "editor.lineHeight": 1.5,
    "editor.lineNumbers": "on",
    "editor.renderLineHighlight": "gutter",
    "editor.cursorBlinking": "smooth",
    "editor.cursorWidth": 2,
    "editor.minimap.showSlider": "always",
    "editor.lightbulb.enabled": false,
    "editor.scrollbar.verticalScrollbarSize": 4,
    "editor.scrollbar.horizontalScrollbarSize": 4,
    "terminal.integrated.fontSize": 14,
    "terminal.integrated.fontFamily": "Input Mono",
    "terminal.integrated.fontWeight": "300",
    "terminal.integrated.fontWeightBold": "500",
    "terminal.integrated.letterSpacing": 1,
}
```

### Applying CSS Styles

The font and spacing adjustments of this theme rely on loading custom CSS styles into VSCode. This can be achieved by the [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) extension.

Once Custom CSS and JS Loader is installed, you need to configure it to load the custom CSS styles from this theme. To do this, open the Command Palette (`Ctrl+Shift+P` or `⇧⌘P`) and run the **Preferences: Open User Settings (JSON)** command. Then, add the following settings to your `settings.json` file:

```json
{
    "vscode_custom_css.imports": [
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/main.css",
        // Optional
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/font-input.css",
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/fixed-debug-toolbar.css",
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
        "https://raw.githubusercontent.com/zetavg/spacegray-input-vscode/main/themes/css/no-pointers.css",
        // ... see https://github.com/zetavg/spacegray-input-vscode/tree/main/themes/css for all available CSS files
    ]
}
</pre>
</details>

Finally, run the **Custom CSS and JS: Reload Custom CSS and JS** command from the Command Palette (`Ctrl+Shift+P` or `⇧⌘P`) to load the custom CSS styles, and restart VSCode.

> If you encounter permission errors when running the **Custom CSS and JS: Reload Custom CSS and JS** command on Linux or Mac, you may need to change the owner of the VSCode executable and its installation directory to your user account. To do this, run the following commands in the terminal:
>
> ```bash
> sudo chown -R $(whoami) "$(which code)"
> sudo chown -R $(whoami) /usr/share/code
> ```

> [!NOTE]
>
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

* Run `npm run compile-css` to compile CSS files after changing any `.postcss` files.
* Run `npm run copy-themes` after modifying any theme files.


## Credits

This theme is based on the [Spacegray](https://github.com/SublimeText/Spacegray) theme for sublime text and the [Spacegray VSCode](https://github.com/mihai-vlc/spacegray-vscode/tree/master?tab=readme-ov-file) theme by Mihai Ionut Vilcu (mihai-vlc).

The included product icon theme is a modified version of the [Carbon Icons](https://github.com/antfu/vscode-icons-carbon) made by Anthony Fu (antfu).


## License

[Carbon Icons](https://github.com/carbon-design-system/carbon/tree/main/packages/icons) by IBM are licensed under [Apache License 2.0](https://github.com/carbon-design-system/carbon/blob/main/LICENSE).

Other files are licensed under MIT.
