# hueforge-at-home
Basic javascript implementation of layer-color mixing for 3d printing

![image](https://github.com/LucasKendi/hueforge-at-home/assets/17439541/2f968e0b-d4d2-4d80-ba78-e1022315be6c)

It does not generate stl files from images (like hueforge actually does), so I recommend converting your images to stl using something like https://3dp.rocks/lithophane/

## Running on Windows with VS code:
  - Download this project and open it on VS Code
  - Add the VS Code [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
 - Click on the `Go Live` button on the bottom right corner
 - It will open your browser on the local server, usually on port 5500
 - You can edit the image path and layers in the `main.js` file
 
## Running on Windows with nodejs:

- Install [nodejs](https://nodejs.org/en)
- [Download](https://github.com/Davidster/hueforge-at-home/archive/refs/heads/main.zip) this project and unzip it
- Open a terminal window in the folder where you unzipped the project (the folder where `index.html` is located) by opening the folder in File Explorer and typing 'cmd' in the search bar like so:

![image](https://github.com/Davidster/ikari/assets/2389735/1a0d58aa-056d-413e-8577-f2431cd21b9b)

- Run the following command:

```sh
npx serve
```

- It should download some dependencies then give you a message that says "Serving!" like this:

![image](https://github.com/Davidster/ikari/assets/2389735/8d39231d-d96f-4ec0-a44b-46be2dd8687f)

> :warning: If you get an error like npm ERR! code ENOENT, run this command then try again:
> 
> `mkdir "%AppData%\npm"`

- Open up the URL in your browser. For the screenshot above, that would be: http://localhost:3000

- You can replace the `input_image.png` file with any image you want (just make sure it has this exact name and path) then refresh the page. If you need to use a jpg instead of png the you would need to make some modifications to main.js (edit the line `name = "input_image.png"` to point to your jpg file name) It will keep working as long as you keep the cmd window open with the `npx serve` program running.
