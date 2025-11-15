"""Add AI image validation fields

Revision ID: fab78a70824e
Revises: 845a44fffa65
Create Date: 2025-11-14 19:55:22.348811

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fab78a70824e'
down_revision: Union[str, None] = '845a44fffa65'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch mode for SQLite
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ai_image_valid', sa.Integer(), nullable=True, server_default='1'))
        batch_op.add_column(sa.Column('ai_severity_score', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('ai_observed_details', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('ai_quantity_assessment', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('ai_rejection_reason', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Use batch mode for SQLite
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.drop_column('ai_rejection_reason')
        batch_op.drop_column('ai_quantity_assessment')
        batch_op.drop_column('ai_observed_details')
        batch_op.drop_column('ai_severity_score')
        batch_op.drop_column('ai_image_valid')
