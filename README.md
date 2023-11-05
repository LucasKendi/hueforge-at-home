# hueforge-at-home
Basic javascript implementation of layer-color mixing for 3d printing

![image](https://github.com/LucasKendi/hueforge-at-home/assets/17439541/2f968e0b-d4d2-4d80-ba78-e1022315be6c)

It does not generate stl files from images (like hueforge actually does), so I recommend converting your images to stl using something like https://3dp.rocks/lithophane/

## To run on Windows:

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

- Open up the URL in your browser. For the screenshot above, that would be: http://localhost:3000

- You can replace the `input_image.png` file with any image you want (just make sure it has this exact name and path) then refresh the page. It will keep working as long as you keep the cmd window open with the `npx serve` program running.