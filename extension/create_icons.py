from PIL import Image

sizes = [16, 48, 128]
for size in sizes:
    img = Image.new('RGB', (size, size), color=(99, 102, 241))
    img.save(f'icon{size}.png')

print("✅ Icons created!")
