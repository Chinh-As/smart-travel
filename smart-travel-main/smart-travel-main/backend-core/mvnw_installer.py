import urllib.request
import os

base_url = "https://raw.githubusercontent.com/apache/maven-wrapper/maven-wrapper-3.3.2/"
files = [
    ("mvnw", "mvnw"),
    ("mvnw.cmd", "mvnw.cmd"),
    (".mvn/wrapper/maven-wrapper.properties", "maven-wrapper.properties")
]

os.makedirs(".mvn/wrapper", exist_ok=True)

for dest, name in files:
    print(f"Downloading {name}...")
    urllib.request.urlretrieve(base_url + name, dest)
    if dest == "mvnw":
        os.chmod(dest, 0o755)

print("Maven wrapper downloaded successfully.")
