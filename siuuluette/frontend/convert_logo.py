from PIL import Image

def make_white(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If it's not fully transparent, make it white
        if item[3] > 0:
            # Change any color to White (255, 255, 255) maintaining existing alpha
            newData.append((255, 255, 255, item[3]))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Success: {output_path} created.")

if __name__ == "__main__":
    make_white(r"d:\proyectos\siuuluette-brand\siuuluette\public\Siu.png", 
               r"d:\proyectos\siuuluette-brand\siuuluette\public\Siu_white.png")
