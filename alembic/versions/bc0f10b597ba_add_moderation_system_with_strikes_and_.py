"""Add moderation system with strikes and bans

Revision ID: bc0f10b597ba
Revises: fab78a70824e
Create Date: 2025-11-14 20:19:31.352901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bc0f10b597ba'
down_revision: Union[str, None] = 'fab78a70824e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create strikes table
    op.create_table('strikes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('reason', sa.Text(), nullable=False),
    sa.Column('severity', sa.String(), nullable=False),
    sa.Column('content_type', sa.String(), nullable=False),
    sa.Column('ai_detection', sa.Text(), nullable=True),
    sa.Column('is_offensive', sa.Integer(), server_default='0', nullable=False),
    sa.Column('is_joke', sa.Integer(), server_default='0', nullable=False),
    sa.Column('is_inappropriate', sa.Integer(), server_default='0', nullable=False),
    sa.Column('report_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_strikes_id'), 'strikes', ['id'], unique=False)
    
    # Add moderation columns to users table using batch mode
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('strike_count', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('is_banned', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('ban_until', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('ban_reason', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('last_strike_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove moderation columns from users table using batch mode
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('last_strike_at')
        batch_op.drop_column('ban_reason')
        batch_op.drop_column('ban_until')
        batch_op.drop_column('is_banned')
        batch_op.drop_column('strike_count')
    
    op.drop_index(op.f('ix_strikes_id'), table_name='strikes')
    op.drop_table('strikes')
