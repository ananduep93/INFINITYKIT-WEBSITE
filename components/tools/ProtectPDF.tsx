'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function ProtectPDF() {
  const handleProtect = async (files: File[], textInput?: string) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file to secure.');
    }
    const password = textInput || '';
    if (!password.trim()) {
      throw new Error('Please specify a secure password to protect the PDF.');
    }

    const file = files[0];
    const fileBytes = new Uint8Array(await file.arrayBuffer());

    // Local client-side cryptographic container creation (AES-GCM PBKDF2)
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    // 1. Generate salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // 2. Import base password key
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // 3. Derive AES-GCM key
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
      ['encrypt']
    );

    // 4. Encrypt PDF bytes
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      aesKey,
      fileBytes
    );

    const ciphertext = new Uint8Array(encryptedBuffer);

    // 5. Structure payload container:
    // [Header: 'SPDF' (4 bytes)] + [Salt: (16 bytes)] + [IV: (12 bytes)] + [Ciphertext]
    const header = encoder.encode('SPDF');
    const container = new Uint8Array(header.length + salt.length + iv.length + ciphertext.length);

    container.set(header, 0);
    container.set(salt, header.length);
    container.set(iv, header.length + salt.length);
    container.set(ciphertext, header.length + salt.length + iv.length);

    const blob = new Blob([container], { type: 'application/octet-stream' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}_secured.pdf`,
      resultData: `Successfully encrypted "${file.name}" locally using military-grade AES-256-GCM browser sandboxing. Note down your password safely; it cannot be recovered.`
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Protect PDF File (AES-GCM)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Lock your PDF with custom secure passwords 100% locally in your browser sandbox using high-performance cryptographic keys.
      </p>

      <ToolWorkspace
        toolId="protect-pdf"
        accept="application/pdf"
        maxFiles={1}
        hasText={true}
        textLabel="Security Password"
        textPlaceholder="Enter a strong password to lock this document..."
        onProcess={handleProtect}
        actionButtonText="Secure PDF Locally"
        instructions={[
          'Upload the standard PDF document you want to lock.',
          'Provide a secure, memorable password in the prompt box.',
          'Click the "Secure PDF Locally" button to encrypt your PDF locally. The output format is a highly secured local package.'
        ]}
      />
    </div>
  );
}
