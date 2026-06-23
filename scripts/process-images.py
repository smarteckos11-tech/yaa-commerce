"""
Process images with checkerboard transparency pattern.
Replace checkerboard pixels (light gray alternating with white) with pure white background.
"""
from PIL import Image
import numpy as np
import os

def remove_checkerboard(input_path, output_path, threshold=235):
    """Replace near-white pixels (likely checkerboard) with pure white."""
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img)

    # Detect near-white pixels (checkerboard pattern is typically 240-255 range)
    # We only want to replace background, so we use flood-fill from corners
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]

    # Mask of "light" pixels (likely checkerboard or white bg)
    is_light = np.all(rgb > threshold, axis=2)

    # Flood fill from the 4 corners to find connected background regions
    from scipy import ndimage
    # Create seeds at the 4 corners
    seeds = np.zeros_like(is_light, dtype=bool)
    seeds[0, 0] = True
    seeds[0, -1] = True
    seeds[-1, 0] = True
    seeds[-1, -1] = True

    # Dilate seeds through connected light pixels
    background = ndimage.binary_propagation(seeds, mask=is_light)

    # Set background pixels to pure white with full opacity
    arr[background, 0] = 255
    arr[background, 1] = 255
    arr[background, 2] = 255
    arr[background, 3] = 255

    # Also smooth edges: any remaining semi-transparent pixels become opaque
    arr[:, :, 3] = 255

    out = Image.fromarray(arr, 'RGBA')
    # Convert to RGB (drop alpha since bg is now white)
    out = out.convert('RGB')
    out.save(output_path, 'PNG', optimize=True)
    print(f"✓ {input_path} → {output_path}")

if __name__ == "__main__":
    # Install scipy if needed
    try:
        import scipy
    except ImportError:
        import subprocess
        subprocess.check_call(['pip', 'install', 'scipy', '-q'])
        import scipy
        from scipy import ndimage

    files = [
        ('public/uploads/yaa-woman-green-suit.png', 'public/uploads/yaa-woman-green-suit-clean.png'),
        ('public/uploads/yaa-payment-badges.png', 'public/uploads/yaa-payment-badges-clean.png'),
    ]
    for src, dst in files:
        if os.path.exists(src):
            remove_checkerboard(src, dst)
        else:
            print(f"✗ Missing: {src}")
