import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          1. Data Collection
        </h3>
        <p>
          Brio collects information necessary to operate the In-Flight Entertainment (IFE) platform securely and efficiently. The types of data we collect include:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-1">
          <li>
            <span className="text-zinc-200 font-semibold">Account Information:</span> Username, email address, account creation date, and vault identifier.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Usage Data:</span> Hub navigation patterns, media preferences, game scores, and interaction timestamps.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Device &amp; System Telemetry:</span> CPU, GPU, RAM, storage, screen resolution, and platform information for performance optimization.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Encrypted Vault Data:</span> User-generated content (messages, notes, photos, stickers) encrypted end-to-end with AES-256-GCM. Brio cannot read the contents of your vault.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Location Data:</span> Approximate location inferred from timezone and weather searches, not GPS tracking.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Session Data:</span> Authentication tokens, session duration, and login/logout events.
          </li>
        </ul>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          2. Data Usage
        </h3>
        <p>
          The data we collect is used solely to provide, maintain, and improve the Brio IFE experience. Specifically:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-1">
          <li>Delivering core platform functionality including messaging, media streaming, gaming, and productivity tools</li>
          <li>Personalizing content recommendations and user interface preferences</li>
          <li>Monitoring system performance, diagnosing errors, and maintaining stability</li>
          <li>Enforcing security policies, detecting unauthorized access, and protecting user vaults</li>
          <li>Complying with aviation regulatory requirements and operator audit obligations</li>
          <li>Generating anonymized aggregate analytics for product improvement</li>
        </ul>
        <p>
          Brio does not use your personal data for advertising purposes. No data is sold, rented, or traded to third parties for marketing purposes.
        </p>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          3. Data Sharing
        </h3>
        <p>
          Brio is committed to protecting your privacy. We do not share, sell, or distribute your personal data except in the following limited circumstances:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-1">
          <li>
            <span className="text-zinc-200 font-semibold">Operating Carrier:</span> Anonymized aggregate statistics may be shared with the airline operator for service quality and route analytics.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Legal Obligations:</span> Data may be disclosed if required by law, court order, or government regulation, or to protect the rights, property, or safety of Brio, its users, or the public.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Service Providers:</span> Trusted third-party service providers (e.g., weather data APIs, media streaming services) may receive only the minimum data necessary to perform their functions, under strict confidentiality obligations.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Vault Data:</span> Encrypted vault content is never shared. Only the encrypted payload and metadata are stored server-side; decryption occurs exclusively on the client device.
          </li>
        </ul>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          4. Data Security
        </h3>
        <p>
          Brio employs industry-standard security measures to protect your data at every layer of the platform:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-1">
          <li>
            <span className="text-zinc-200 font-semibold">AES-256-GCM Encryption:</span> All vault data is encrypted client-side before transmission. The master passphrase is never sent to the server.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Secure Key Derivation:</span> Passphrase verification uses PBKDF2 with high iteration counts and unique per-user salts.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Transport Security:</span> All API communications use TLS 1.3 with certificate pinning where available.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Vault Isolation:</span> Each user&apos;s vault is logically isolated. No cross-user data leakage is possible through the application architecture.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Session Management:</span> Authentication tokens expire after inactivity and are invalidated on logout.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Regular Audits:</span> Cryptographic implementations undergo periodic internal review to ensure compliance with security best practices.
          </li>
        </ul>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          5. User Rights
        </h3>
        <p>
          You have the following rights regarding your personal data within the Brio platform:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-1">
          <li>
            <span className="text-zinc-200 font-semibold">Right to Access:</span> You may request a copy of all personal data associated with your account at any time through the Account overlay.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Right to Rectification:</span> You may update or correct your account information (username, email) through the Account settings.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Right to Erasure:</span> You may request deletion of your account and all associated data by contacting the operating carrier&apos;s support team. Vault data deletion is permanent and cannot be reversed.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Right to Data Portability:</span> You may export your vault database at any time via the Export function in the Database Manager.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Right to Object:</span> You may object to the processing of non-essential telemetry data by disabling relevant features in the Security Vault settings.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Right to Withdraw Consent:</span> You may withdraw consent for non-essential data processing at any time by logging out or clearing local application data.
          </li>
        </ul>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          6. Cookie Policy
        </h3>
        <p>
          The Brio IFE platform uses local storage and session storage mechanisms (functionally analogous to cookies) to maintain user sessions, preferences, and application state. Specifically:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-zinc-400 ml-1">
          <li>
            <span className="text-zinc-200 font-semibold">Session Token (brio_session):</span> Retained for the duration of your session to maintain authentication state. Cleared on logout.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Vault Key Cache:</span> Temporarily stored in memory during active sessions to avoid repeated passphrase entry. Never persisted to disk in plaintext.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Preference Storage:</span> UI settings, theme preferences, and algorithm weights are stored locally for convenience.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">No Third-Party Tracking:</span> Brio does not use third-party analytics cookies, advertising beacons, or cross-site tracking mechanisms.
          </li>
          <li>
            <span className="text-zinc-200 font-semibold">Clearing Data:</span> Users may clear all local data through the Security Vault settings or by logging out, which removes the session token from storage.
          </li>
        </ul>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          7. Data Retention
        </h3>
        <p>
          Vault data is retained on the server for the duration of the active account. Upon account deletion, all server-side data is permanently purged within 30 days. Local device data may persist in browser storage until manually cleared. Encrypted vault backups (.db files) are the responsibility of the user and should be securely managed.
        </p>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          8. Children&apos;s Privacy
        </h3>
        <p>
          Brio is designed for general audiences and does not knowingly collect personal information from children under the age of 13. If you become aware that a child has provided personal information without parental consent, please contact the operating carrier&apos;s support team immediately so that appropriate action can be taken.
        </p>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          9. International Data Transfers
        </h3>
        <p>
          Brio may process and store data in multiple jurisdictions depending on the operating carrier&apos;s infrastructure. By using the platform, you consent to the transfer of your data to countries that may have different data protection standards than your country of residence. In all cases, Brio applies equivalent security protections regardless of data location.
        </p>
      </section>

      <section className="skeuo-panel p-5 space-y-3">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
          10. Contact Information
        </h3>
        <p>
          For privacy-related inquiries, data subject access requests, or to report a data breach concern, please contact the Brio support team through the in-app feedback system or via the operating carrier&apos;s designated IT and privacy contact. Include the subject line &quot;Brio IFE — Privacy Inquiry&quot; for prompt routing.
        </p>
      </section>

      <footer className="text-center text-[10px] text-zinc-600 font-mono pt-2 pb-4">
        Last updated: September 2026 &bull; Brio In-Flight Entertainment v2.0
      </footer>
    </div>
  );
};
