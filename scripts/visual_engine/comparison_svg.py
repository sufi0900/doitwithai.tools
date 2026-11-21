"""Editable two-panel comparison from a source-linked section brief."""
from xml.etree import ElementTree as ET
from PIL import ImageFont
from brief_to_deck import deck_from_section

def render_comparison(headline, nodes, blocks, destination):
    sizes = {"blog": (840, None), "mobile": (360, None), "pin": (1000, 1500)}
    width, fixed_height = sizes[destination]
    if len(nodes) != 2:
        raise ValueError("Comparison requires two supported points")
    deck_from_section(headline, nodes, blocks)
    if destination == "pin":
        for scale in (3, 2):
            try:
                return _compose(headline, nodes, width, fixed_height, False, scale)
            except LayoutOverflow:
                continue
        raise LayoutOverflow("Use a longer format for this comparison")
    return _compose(headline, nodes, width, fixed_height, destination == "blog", 1)


class LayoutOverflow(ValueError):
    pass


def _compose(headline, nodes, width, fixed_height, horizontal, scale):
    margin = 20 * scale
    gap = 16 * scale
    box = (width - 2 * margin - gap) // 2 if horizontal else width - 2 * margin
    root = ET.Element("svg", xmlns="http://www.w3.org/2000/svg", width=str(width), role="img")
    ET.SubElement(root,"title").text = headline
    bg = ET.SubElement(root,"rect", width=str(width), fill="#0b1220")
    def label(parent, value, x, top, size, available, color):
        font = ImageFont.truetype("DejaVuSans.ttf",size)
        line = ""
        for word in value.split():
            if font.getlength(word) > available:
                raise LayoutOverflow("Label has an unbreakable word wider than its panel")
            candidate = (line + " " + word).strip()
            if line and font.getlength(candidate) > available:
                top = draw(parent,line,x,top,size,color)
                line = word
            else:
                line = candidate
        return draw(parent,line,x,top,size,color)
    def draw(parent,line,x,top,size,color):
        ET.SubElement(parent,"text",x=str(x),y=str(top+size),fill=color,
                      attrib={"font-size":str(size),"font-family":"DejaVu Sans"}).text=line
        return top + (size*3)//2
    y = label(root,headline,margin,margin,28*scale,width-2*margin,"#fff") + gap
    bottom = y
    for index, node in enumerate(nodes):
        x = margin + (box+gap)*index if horizontal else margin
        top = y if horizontal or index == 0 else bottom+gap
        group = ET.SubElement(root,"g",attrib={"data-source-block-ids": " ".join(node["sourceBlockIds"])})
        rect = ET.SubElement(group,"rect",x=str(x),y=str(top),width=str(box),rx=str(12*scale),fill="#182940")
        end = label(group,node["title"],x+gap,top+gap,22*scale,box-2*gap,"#83e1ff")
        end = label(group,node["detail"],x+gap,end+gap,17*scale,box-2*gap,"#fff") + gap
        rect.set("height",str(end-top))
        bottom=max(bottom,end)
    height = fixed_height or bottom+margin
    if bottom + margin > height:
        raise LayoutOverflow("Use a longer format for this comparison")
    if fixed_height:
        offset = (height - bottom - margin) // 2
        layer = ET.Element("g", transform=f"translate(0 {offset})")
        for child in list(root)[2:]:
            root.remove(child)
            layer.append(child)
        root.append(layer)
    root.set("height",str(height))
    root.set("viewBox",f"0 0 {width} {height}")
    bg.set("height",str(height))
    return ET.tostring(root,encoding="unicode")
