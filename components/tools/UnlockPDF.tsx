'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function UnlockPDF() {
  const handleUnlock = async (files: File[], textInput?: string) => {
    if (files.length === 0) {
      throw new Error('Please upload a locked PDF (.secured.pdf) file.');
    }
    const password = textInput || '';
    if (!password.trim()) {
      throw new Error('Please enter the password to decrypt the PDF.');
    }

    const file = files[0];
    const container = new Uint8Array(await file.arrayBuffer());

    // Local client-side cryptographic container parsing
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // 1. Verify header 'SPDF'
    const headerBytes = container.subarray(0, 4);
    const headerText = decoder.decode(headerBytes);
    if (headerText !== 'SPDF') {
      throw new Error('Invalid file format. Please upload a PDF secured by InfinityKit (.secured.pdf).');
    }

    // 2. Extract Salt, IV, and Ciphertext
    const salt = container.subarray(4, 20);
    const iv = container.subarray(20, 32);
    const ciphertext = container.subarray(32);

    try {
      // 3. Import base password key
      const baseKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // 4. Derive AES-GCM decryption key
      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // 5. Decrypt ciphertext
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        aesKey,
        ciphertext
      );

      const decryptedPdfBytes = new Uint8Array(decryptedBuffer);
      const blob = new Blob([decryptedPdfBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      return {
        downloadUrl,
        fileName: file.name.replace(/\.secured\.pdf$/i, '.pdf'),
        resultData: `Successfully decrypted and unlocked standard PDF from "${file.name}" locally using matching AES key blocks.`
      };
    } catch (err) {
      throw new Error('Incorrect decryption key password or corrupted file structure.');
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Unlock Protected PDF
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Unlock and restore standard PDF documents from secure encrypted containers (.secured.pdf) by entering the correct password.
      </p>

      <ToolWorkspace
        toolId="unlock-pdf"
        accept=".pdf"
        maxFiles={1}
        hasText={true}
        textLabel="Decryption Password"
        textPlaceholder="Enter password to unlock this file..."
        onProcess={handleUnlock}
        actionButtonText="Unlock Document"
        instructions={[
          'Upload the encrypted file (.secured.pdf) you wish to unlock.',
          'Type the original password that was used to secure the PDF.',
          'Click the "Unlock Document" button to compile your restored PDF locally.'
        ]}
      />
    </div>
  );
}
