import os
import json
import shutil
import time
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

class AssetManagerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Oreejoy Asset Manager")
        self.root.geometry("500x550")
        self.root.configure(bg="#eef2f6")
        
        # Track selected image path
        self.selected_image_path = ""
        
        # Style configurations
        style = ttk.Style()
        style.configure("TLabel", background="#eef2f6", font=("Arial", 10, "bold"))
        style.configure("TButton", font=("Arial", 10, "bold"))
        
        # Header text
        title_lbl = tk.Label(root, text="Asset Upload Interface", font=("Arial", 16, "bold"), fg="#2563eb", bg="#eef2f6")
        title_lbl.pack(pady=15)
        
        # Container frame
        form_frame = tk.Frame(root, bg="white", padx=20, pady=20, bd=1, relief="solid", highlightthickness=0)
        form_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # 1. Target Section Dropdown
        tk.Label(form_frame, text="Target Content Section", font=("Arial", 9, "bold"), bg="white", fg="#475569").pack(anchor="w", pady=(0, 2))
        self.section_var = tk.StringVar(value="hero")
        self.section_select = ttk.Combobox(form_frame, textvariable=self.section_var, state="readonly", width=40)
        self.section_select['values'] = ('hero', 'publications')
        self.section_select.pack(fill="x", pady=(0, 10))
        
        # 2. Title Input
        tk.Label(form_frame, text="Title", font=("Arial", 9, "bold"), bg="white", fg="#475569").pack(anchor="w", pady=(0, 2))
        self.title_entry = tk.Entry(form_frame, font=("Arial", 10), bd=1, relief="solid")
        self.title_entry.pack(fill="x", pady=(0, 10), ipady=4)
        
        # 3. Category Tag Input
        tk.Label(form_frame, text="Category Tag", font=("Arial", 9, "bold"), bg="white", fg="#475569").pack(anchor="w", pady=(0, 2))
        self.tag_entry = tk.Entry(form_frame, font=("Arial", 10), bd=1, relief="solid")
        self.tag_entry.pack(fill="x", pady=(0, 10), ipady=4)
        
        # 4. Description Input
        tk.Label(form_frame, text="Description Details", font=("Arial", 9, "bold"), bg="white", fg="#475569").pack(anchor="w", pady=(0, 2))
        self.desc_text = tk.Text(form_frame, font=("Arial", 10), height=5, bd=1, relief="solid")
        self.desc_text.pack(fill="x", pady=(0, 10))
        
        # 5. File Picker Buttons
        tk.Label(form_frame, text="Upload Media Image", font=("Arial", 9, "bold"), bg="white", fg="#475569").pack(anchor="w", pady=(0, 2))
        file_btn_frame = tk.Frame(form_frame, bg="white")
        file_btn_frame.pack(fill="x", pady=(0, 15))
        
        self.file_label = tk.Label(file_btn_frame, text="No file selected", font=("Arial", 9, "italic"), bg="white", fg="#64748b", wraplength=250, justify="left")
        self.file_label.pack(side="left", fill="x", expand=True)
        
        browse_btn = tk.Button(file_btn_frame, text="Browse...", command=self.browse_file, bg="#f1f5f9", font=("Arial", 9, "bold"))
        browse_btn.pack(side="right", padx=5)
        
        #Submit Button 
        submit_btn = tk.Button(root, text="Process & Automate Setup", command=self.process_upload, bg="#2563eb", fg="white", font=("Arial", 11, "bold"), padx=10, pady=10, relief="flat")
        submit_btn.pack(fill="x", padx=20, pady=15)

    def browse_file(self):
        file_path = filedialog.askopenfilename(
            title="Select Image Asset",
            filetypes=[("Image Files", "*.png *.jpg *.jpeg *.webp *.gif")]
        )
        if file_path:
            self.selected_image_path = file_path
            self.file_label.config(text=os.path.basename(file_path), fg="#0f172a", font=("Arial", 9, "bold"))

    def process_upload(self):
        section = self.section_var.get()
        title = self.title_entry.get().strip()
        tag = self.tag_entry.get().strip()
        desc = self.desc_text.get("1.0", tk.END).strip()
        
        # Validations
        if not title or not tag or not desc or not self.selected_image_path:
            messagebox.showerror("Error", "All fields are required, including an image file.")
            return
            
        try:
            # 1. Target Folder & File Extensions Setup
            dest_dir = os.path.join("assets", section)
            os.makedirs(dest_dir, exist_ok=True)
            
            file_extension = os.path.splitext(self.selected_image_path)[1]
            prefix = "slide_" if section == "hero" else "pub_"
            new_filename = f"{prefix}{int(time.time())}{file_extension}"
            dest_file_path = os.path.join(dest_dir, new_filename)
            
            # 2. Copy the file into the asset folder
            shutil.copy(self.selected_image_path, dest_file_path)
            
            # 3. Read and Update JSON Configurations
            json_filename = "hero-rotator.json" if section == "hero" else "publications.json"
            json_path = os.path.join("data", json_filename)
            os.makedirs(os.path.dirname(json_path), exist_ok=True)
            
            current_data = []
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        current_data = json.load(f)
                except json.JSONDecodeError:
                    current_data = []
            
            # Formulate the payload entry object matching JavaScript expectations
            relative_img_path = f"assets/{section}/{new_filename}"
            new_entry = {
                "id": f"{section}-{int(time.time())}",
                "title": title,
                "tag": tag,
                "img": relative_img_path,
                "desc": desc
            }
            
            current_data.append(newEntry)
            
            # Write back formatted entry data
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(current_data, f, indent=2, ensure_ascii=False)
                
            # Success Operations cleanup
            messagebox.showinfo("Success", f"Asset successfully copied to {relative_img_path} and JSON registers updated!")
            
            # Reset UI form inputs cleanly
            self.title_entry.delete(0, tk.END)
            self.tag_entry.delete(0, tk.END)
            self.desc_text.delete("1.0", tk.END)
            self.file_label.config(text="No file selected", fg="#64748b", font=("Arial", 9, "italic"))
            self.selected_image_path = ""
            
        except Exception as e:
            messagebox.showerror("System Error", f"An anomaly occurred: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = AssetManagerApp(root)
    root.mainloop()