import os
import json

# 配置：哪些文件夹需要扫描生成下拉菜单/分类列表
# 格式：{"目录名": {"type": "dropdown|list", "label": "显示名称"}}
# dropdown: 生成顶部下拉菜单（如 HORROR）
# list:     只生成分类列表页，不生成下拉（如 BLOG）
CATEGORIES = {
    "blog":  {"type": "list",    "label": "Blog"},
    "horror": {"type": "dropdown", "label": "Horror"},
    "papers": {"type": "dropdown", "label": "Papers"},
    "courses": {"type": "dropdown", "label": "Courses"},
    "dsge": {"type": "dropdown", "label": "DSGE"},
}

CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content")

def scan_category(folder_name):
    """扫描某个分类目录下的 .md 文件，返回文件列表"""
    folder_path = os.path.join(CONTENT_DIR, folder_name)
    if not os.path.isdir(folder_path):
        return []
    
    items = []
    for filename in sorted(os.listdir(folder_path)):
        if not filename.endswith(".md"):
            continue
        # 去掉 .md 后缀作为路径和标题
        name_without_ext = filename[:-3]
        item = {
            "file": filename,
            "title": name_without_ext,
            "path": f"{folder_name}/{name_without_ext}"
        }
        items.append(item)
    return items

def build_manifest():
    """扫描所有配置的分类目录，生成 manifest.json"""
    manifest = {}
    for folder, config in CATEGORIES.items():
        items = scan_category(folder)
        if items:
            manifest[folder] = items
    
    manifest_path = os.path.join(CONTENT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    
    print(f"✅ manifest.json 已生成：{manifest_path}")
    for folder, items in manifest.items():
        print(f"   📁 {folder}: {len(items)} 篇")
    
    if not manifest:
        print("   ⚠️ 未扫描到任何文章，请在 content/ 下的对应目录中放入 .md 文件")

if __name__ == "__main__":
    build_manifest()
