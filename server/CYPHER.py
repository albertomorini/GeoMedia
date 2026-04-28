import sys
import os
import binascii
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend


password = "Fidelio99"
algorithm = "aes-256-cbc"


# ----------------------------------------------------
def make_key(password: str) -> bytes:
    key = password.encode("utf-8")
    return (key + b"\x00" * 32)[:32]


# ----------------------------------------------------
# ENCRYPT
def encrypt(password: str, text: bytes) -> str:
    key = make_key(password)
    iv = os.urandom(16)

    # PKCS7 padding (Node crypto handles padding implicitly)
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(text) + padder.finalize()

    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()
    )

    encryptor = cipher.encryptor()
    encrypted = encryptor.update(padded_data) + encryptor.finalize()

    return iv.hex() + encrypted.hex()


# ----------------------------------------------------
# DECRYPT
def decrypt(password: str, text: str) -> str:
    key = make_key(password)

    iv = bytes.fromhex(text[:32])
    encrypted_text = bytes.fromhex(text[32:])

    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()
    )

    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(encrypted_text) + decryptor.finalize()

    # remove padding
    unpadder = padding.PKCS7(128).unpadder()
    decrypted = unpadder.update(decrypted_padded) + unpadder.finalize()

    return decrypted.decode("utf-8")


# ----------------------------------------------------
# CLI
if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else None
    file_name = sys.argv[2] if len(sys.argv) > 2 else None

    if mode and file_name:
        if mode == "encrypt":
            with open(file_name, "rb") as f:
                content = f.read()

            encrypted = encrypt(password, content)

            with open(file_name, "w") as f:
                f.write(encrypted)

            print("Encryption done.")

        elif mode == "decrypt":
            with open(file_name, "r") as f:
                content = f.read()

            decrypted = decrypt(password, content)

            with open(file_name, "w") as f:
                f.write(decrypted)

            print("Decryption done.")

        else:
            print("Invalid mode. Use encrypt or decrypt.")

    else:
        print("1 (mode): encrypt / decrypt")
        print("2 (file.json): DBconfig.json")


# ----------------------------------------------------
# EXPORT-LIKE USAGE
__all__ = ["encrypt", "decrypt"]