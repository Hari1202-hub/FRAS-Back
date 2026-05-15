<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AppClientModel extends Model
{
    protected $table    = 'tbl_app_clients';
    protected $fillable = [
        'uuid', 'name', 'client_id', 'client_secret',
        'access_token', 'token_expires_at', 'is_active', 'last_used_at',
    ];

    protected $hidden = ['client_secret', 'access_token'];

    protected $casts = [
        'is_active'        => 'boolean',
        'token_expires_at' => 'datetime',
        'last_used_at'     => 'datetime',
    ];

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function verifySecret(string $rawSecret): bool
    {
        return Hash::check($rawSecret, $this->client_secret);
    }

    public function verifyToken(string $rawToken): bool
    {
        if (!$this->access_token) return false;
        return hash_equals($this->access_token, hash('sha256', $rawToken));
    }

    public function isTokenExpired(): bool
    {
        return $this->token_expires_at && now()->isAfter($this->token_expires_at);
    }

    /**
     * Issue a new access token, store the hash, and save.
     * Returns the raw (unhashed) token — shown once, never stored raw.
     */
    public function issueToken(int $ttlHours = 24): string
    {
        $raw = Str::random(64);

        $this->access_token     = hash('sha256', $raw);
        $this->token_expires_at = now()->addHours($ttlHours);
        $this->save();

        return $raw;
    }

    public function revokeToken(): void
    {
        $this->access_token     = null;
        $this->token_expires_at = null;
        $this->save();
    }
}
