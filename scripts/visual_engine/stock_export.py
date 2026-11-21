"""Render an approved local visual for a cover or pin with a visible credit."""
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont, ImageOps, PngImagePlugin
from stock_selection import select_stock


def stock_png(catalog, image_bytes, *, tenant, destination, topics):
    sizes = {"feature": (1200, 630), "pin": (1000, 1500)}
    width, height = sizes[destination]
    asset = select_stock(catalog, tenant=tenant, destination=destination,
                         topics=topics, can_display_credit=True)
    if asset is None:
        return None
    credit = asset.credit
    font = ImageFont.truetype("DejaVuSans.ttf", 28)
    lines = []
    for paragraph in credit.splitlines():
        line = ""
        for word in paragraph.split():
            candidate = (line + " " + word).strip()
            if font.getlength(word) > width - 64:
                raise ValueError("Credit exceeds available width")
            if line and font.getlength(candidate) > width - 64:
                lines.append(line)
                line = word
            else:
                line = candidate
        if line:
            lines.append(line)
    footer = 32 + 40 * len(lines) if lines else 0
    if footer > height // 3:
        raise ValueError("Choose a composition with more credit space")
    with Image.open(BytesIO(image_bytes[asset.asset_id])) as source:
        photo = ImageOps.contain(ImageOps.exif_transpose(source).convert("RGBA"),
                                (width, height-footer))
    canvas = Image.new("RGB", (width, height), "#0b1220")
    canvas.paste(photo, ((width-photo.width)//2, (height-footer-photo.height)//2), photo)
    draw = ImageDraw.Draw(canvas)
    for index, line in enumerate(lines):
        draw.text((32,height-footer+16+40*index), line, font=font, fill="white")
    metadata = PngImagePlugin.PngInfo()
    for key, value in (("Asset",asset.asset_id),("Credit",credit)):
        metadata.add_itxt(key,value)
    out = BytesIO()
    canvas.save(out, format="PNG", pnginfo=metadata)
    return out.getvalue()
