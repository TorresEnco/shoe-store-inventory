BEGIN;

CREATE TABLE IF NOT EXISTS sale_idempotency (
    actor_id bigint NOT NULL,
    request_key uuid NOT NULL,
    request_hash varchar(64) NOT NULL,
    sale_id bigint REFERENCES sales (id),
    PRIMARY KEY (actor_id, request_key)
);

COMMIT;
